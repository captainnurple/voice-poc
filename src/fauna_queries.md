# add/delete after given date

Select(
  ["data"],
  Paginate(
    Documents(Collection("Recording")),
    {
      events: true,
      after: Date("2022-04-01")
    }
  )
)

# All docs created OR changed after given timestamp

Map(Paginate(
    Range(
      Match(Index("rec_by_ts")),
      ToMicros(Time("2022-04-01T19:12:07.121247Z")),
      null
    )
  ),
  Lambda(['ts', 'ref'], Paginate(Var('ref'), {events: true, after: Time("2022-04-01T19:12:07.121247Z")}))
)


# Transcript in updated docs after given timestamp

Map(Paginate(
    Range(
      Match(Index("rec_by_ts")),
      ToMicros(Time("2022-04-04T19:12:07.121247Z")),
      null
    )
  ),
  Lambda(['ts', 'ref'],
  Select(
    ["data", 1, "data", "transcript"],
    Paginate(Var('ref'), {events: true, after: Time("2022-04-04T19:12:07.121247Z")}))
  )
)


# Update events for a SPECIFIC document

Filter(
  Select(
    ["data"],
    Paginate(Events(Ref(Collection("Recording"), "328055367042859074")))
  ),
  Lambda(
    "event",
    Equals(
      Select(["action"], Var("event")),
      "update"
    )
  )
)

# NOTE that in the case of a new upload, I'll have an explicit transcript document reference so I can query directly on it (Or, in the case of multiple uploads, an array). So I can probably just use this last one (above). Possibly even with an index...

# Fetch Recording reference by file prefix:

Select(
  ["data", 0],
  Paginate(
    Match(
      Index("rec_by_filePrefix"), "cb27daef_4bfc_4f69_9d44_113e4605bad2__1649116799673"
    )
  )
)

# Update events for a specific document based on prefix
Filter(
  Select(
    ["data"],
    Paginate(Events(
      Select(
        ["data", 0],
        Paginate(
          Match(
            Index("rec_by_filePrefix"), "cb27daef_4bfc_4f69_9d44_113e4605bad2__1649116799673"
          )
        )
      )      
    ))
  ),
  Lambda(
    "event",
    Equals(
      Select(["action"], Var("event")),
      "update"
    )
  )
)

# Fetch Recording Object based on File Prefix with SECURITY CHECK that user with given Netlify ID has valid ownership of that file
Intersection(
  Select(
    ["data"],
    Paginate(
      Match(
        Index("rec_by_filePrefix"), "cb27daef_4bfc_4f69_9d44_113e4605bad2__1649116799673"
      )
    )
  ),
  Select(
    ["data"],
    Paginate(
      Match(
        Index("recordings_for_user_ref"), 
        Select(
          ["data"],
          Paginate(
            Match(
              Index("user_search_by_netlifyID"), 
              "cb27daef-4bfc-4f69-9d44-113e4605bad2"
            )
          )
        )
      )
    )
  )
)

# Function to grab UPDATE events for a specific file prefix, checked against NetlifyID for valid ownership


Query(
  Lambda(
    ["filePrefix", "netlifyID"],
    Map(
      Select(
        ["data"],
        Paginate(
          Events(
            Select(
              [0],
              Intersection(
                Select(
                  ["data"],
                  Paginate(Match(Index("rec_by_filePrefix"), Var("filePrefix")))
                ),
                Select(
                  ["data"],
                  Paginate(
                    Match(
                      Index("recordings_for_user_ref"),
                      Select(
                        ["data"],
                        Paginate(
                          Match(
                            Index("user_search_by_netlifyID"),
                            Var("netlifyID")
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      ),
      Lambda("event", [
        If(
          ContainsField("title", Select(["data"], Var("event"))),
          { fileData: Var("event") },
          null
        ),
        If(
          Equals(Select(["action"], Var("event")), "update"),
          { update: Var("event") },
          null
        )
      ])
    )
  )
)

# First check whether a doc exists, then do some stuff. This will be important for e.g. transcript polling

Let(
  {
    recRef : Select('ref', Get(Match(Index("rec_by_filePrefix"), "cb27daef_4bfc_4f69_9d44_113e4605bad2__1645769224902"))),
  },
  If(
    Exists(Var('recRef')),
    Map([Var('recRef')],Lambda('ref', {entry:Var('ref')})),
    'DNE'
  )
)

# HUGE: check whether recording exists, if it doesn't, return DNE, if it does w/ no transcript, return status, otherwise return status with transcript

Let({
  passedPrefix : 'cb27daef_4bfc_4f69_9d44_113e4605bad2__1649780305155',
  recExists : Exists(
    Match(Index('rec_by_filePrefix'), Var('passedPrefix'))
  )
  },
  If(
    Var('recExists'),
    Map([Get(
      Match(Index('rec_by_filePrefix'), Var('passedPrefix'))
      )],
      Lambda('rec',
        If(
          ContainsPath(['data', 'transcript'], Var('rec')),
          {
            status:'complete',
            ref: Select(['ref'], Var('rec')),
            filePrefix: Select(['data', 'transloadit', 'fields', 'filePrefix'], Var('rec')),
            transcript:Select(['data','transcript'], Var('rec'))
          },
          {
            status:'transcribing',
            ref: Select(['ref'], Var('rec')),
            filePrefix: Select(['data', 'transloadit', 'fields', 'filePrefix'], Var('rec')),
          }
        )
      )
    ),
    Map(['DNE'], Lambda('x', {
      status: Var('x'),
      filePrefix: Var('passedPrefix')
    }))
  ),
)

# Above with netlifyID security filter
