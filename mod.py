import os

def generate_require_statements(directory):
    # Get all the files in the directory
    files = os.listdir(directory)

    # Filter only .js files
    js_files = [f for f in files if f.endswith('.js')]

    # Generate the require statements for each .js file
    for js_file in js_files:
        # Remove the '.js' extension and format the require statement
        module_name = os.path.splitext(js_file)[0]
        print(f"const {module_name} = require('./modules/{module_name}');")

# Example usage: specify the folder where your .js files are located
directory = './modules'  # Change this to the path of your modules folder
generate_require_statements(directory)