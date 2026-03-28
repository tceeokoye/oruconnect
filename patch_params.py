import os
import re

api_dir = r"c:\Users\HP\OneDrive\Desktop\Personal Projects\oruconnect\src\app\api"

# Regex to find synchronous params in route signatures
# Match: `params }: { params: { id: string } }` or `params }: { params: { postId: string } }`
sig_pattern = re.compile(r"\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*([a-zA-Z0-Id]+)\s*:\s*string\s*\}\s*\}")

for root, _, files in os.walk(api_dir):
    for f in files:
        if f == "route.ts":
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()
            
            original_content = content
            
            # Find all matches
            matches = sig_pattern.finditer(content)
            
            for match in matches:
                param_name = match.group(1) # e.g. 'id' or 'postId'
                
                # Replace the signature to use Promise<{ ... }>
                replacement_sig = f"{{ params }}: {{ params: Promise<{{ {param_name}: string }}> }}"
                content = content.replace(match.group(0), replacement_sig)
                
                # Now we need to handle the variable extraction.
                # Common pattern: `const { id } = params` or `const postId = params.id` or `const { id } = params;`
                
                # Pattern 1: `const { id } = params`
                destruct_pattern = re.compile(rf"const\s+{{\s*{param_name}\s*}}\s*=\s*params;?")
                content = destruct_pattern.sub(f"const {{ {param_name} }} = await params;", content)
                
                # Pattern 2: `params.{param_name}` (direct usage instead of destructuring)
                # If there is `params.{param_name}`, we need to inject `const {{ {param_name} }} = await params;` at the start of the function,
                # BUT this is tricky to do purely with regex if there are multiple functions.
                # Instead, let's just do a naive injection right after `{` of the function, or replace `params.id` with `(await params).id`.
                # Actually replacing `params.id` with `(await params).id` or `params.postId` with `(await params).postId` is very safe and inline!
                content = re.sub(rf"params\.{param_name}(?!\w)", f"(await params).{param_name}", content)
            
            # If changed, write back
            if content != original_content:
                with open(filepath, "w", encoding="utf-8") as file:
                    file.write(content)
                print(f"Patched: {filepath}")
