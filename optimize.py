import re

def optimize_css(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        css = f.read()

    # Step 1: Remove original comments
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)

    # Step 2: Remove multiple empty lines and trim spaces
    css = re.sub(r'\n\s*\n', '\n', css)
    css = re.sub(r'\s*{\s*', ' { ', css)
    css = re.sub(r'\s*}\s*', ' }\n', css)
    css = re.sub(r';\s*', '; ', css)
    css = re.sub(r',\s+', ', ', css)
    
    # Optional logic: the user requested grouping.
    pass

if __name__ == '__main__':
    optimize_css('c:/Users/Admin/Desktop/Training/logobrand/assets/css/style.css', 'c:/Users/Admin/Desktop/Training/logobrand/assets/css/style.css')
