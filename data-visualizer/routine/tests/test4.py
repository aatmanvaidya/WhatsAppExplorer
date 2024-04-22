import os

# Generate 90000 arguments and join them with spaces
args = ' '.join([f'arg{i}' for i in range(1, 90001)])

# Pass the arguments to the ls command using xargs
os.system(f'echo {args} | xargs ls')
