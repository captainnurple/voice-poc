import re
import time

def post_process_text(input_text, strip_auto_punctuation=True):
    processed_text = input_text
    
    if (strip_auto_punctuation):
      pattern = re.compile(r'[,.?;:]')
      processed_text = re.sub(pattern, '')
    
    # replace ` comma` or ` comma,` or `comma.`
    processed_text = re.sub(r' comma(,|.)?', ', ', processed_text, flags=re.I)
    
    # replace ` period` or ` period,` or `period.`
    processed_text = re.sub(r'(\W)*period(,|.)?', '. ', processed_text, flags=re.I)
    
    # replace 'new line' and 'new paragraph'
    processed_text = re.sub(r' new line(\W)*', '\n', processed_text, flags=re.I)
    processed_text = re.sub(' new paragraph(\W)*', '\n\n', processed_text, flags=re.I)

    # unquote, on quote : unquote(s), on quote(s)
    # quote, quotes : quote(s)
    # NOTE: At the moment these are order-sensitive
    def trailing_quote_one(matchobj):
        return '"'
    pattern = re.compile(r'[^\S\n\t][u|U]nquote[s]?')
    processed_text = re.sub(pattern, trailing_quote_one, processed_text)

    def trailing_quote_two(matchobj):
        return '"'
    pattern = re.compile(r'[^\S\n\t][o|O]n quote[s]?')
    processed_text = re.sub(pattern, trailing_quote_two, processed_text)

    def leading_quote(matchobj):
        return '"'
    pattern = re.compile(r'\b[q|Q]uote[s]?[^\S\n\t]')
    processed_text = re.sub(pattern, leading_quote, processed_text)

    # delete leading and trailing spaces from lines
    processed_text = re.sub('\n ', '\n', processed_text)
    processed_text = re.sub(' \n', '\n', processed_text)

    # capitalize the first letter of a new line
    def capitalize(matchobj):
        s = matchobj.group(0)
        n = 1
        return s[:n].lower() + s[n:].capitalize()
    pattern = re.compile('\n[a-z]')
#    logging.debug(re.findall(pattern, processed_text))
    processed_text = re.sub(pattern, capitalize, processed_text)

    # delete any spaces that occur immediately prior to a comma or period
    def nuke_leading_spaces(matchobj):
        s = matchobj.group(0)
        return s[-1]
    pattern = re.compile(r'[^\S\n\t]+[.,?]')
#    logging.debug(re.findall(pattern, processed_text))
    processed_text = re.sub(pattern, nuke_leading_spaces, processed_text)

    # capitalize the first letter after a period
    def capitalize_after_period(matchobj):
        s = matchobj.group(0)
        return s[:-1] + s[-1].capitalize()
    pattern = re.compile(r'[.?][^a-zA-Z]+[a-z]')
    # logging.debug(re.findall(pattern, processed_text))
    processed_text = re.sub(pattern, capitalize_after_period, processed_text)

    # capitalize first letter after a quote
    def capitalize_after_quote(matchobj):
        s = matchobj.group(0)
        return s[:-1] + s[-1].capitalize()
    pattern = re.compile(r'\"[a-z]')
    processed_text = re.sub(pattern, capitalize_after_quote, processed_text)


    # some plan for dealing with the weird proper noun situation. solution might lie in the alternative transcriptions

    return processed_text

transcript = "june 5th comma five PM period. New paragraph. Lord comma, please bless this comma the work of my hands. Period and may you be glorified and it's doing period. Amen period. New paragraph. Mm hmm. They'd only gone a few feet when the men spotted them. Period. A flurry of bullets ricocheted off the wall. Period. A flurry of bullets ricocheted off the wall comma sending hot sparks flashing across their skin. Period. Yeah. A pair of shooters stood at the railing on the other side of the courtyard taking potshots as the man and the girl dove into the corridor he had first emerged from with Mika period. New line quote. We need to stop period. This is not a safe situation. Period. Unquote. The girl said to him as they rounded the first corner comma gaining a little bit of cover period."
start = time.time()

processed_transcript = post_process_text(transcript)
end = time.time()
print(processed_transcript)
print(end - start)