def replace_unencodable_characters(text):
    replaced_text = ""
    
    for char in text:
        try:
            char.encode('utf-8')
            replaced_text += char
        except UnicodeEncodeError:
            replaced_text += '�'
    
    return replaced_text

# Sample text with various characters
sample_text = "Hello! \udc1a How are you 🌟"

# Replace unencodable characters with � using UTF-8 encoding
cleaned_text = replace_unencodable_characters(sample_text)

print("Cleaned text:")
print(cleaned_text)
