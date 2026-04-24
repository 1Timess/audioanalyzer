# Large File Strategy

## Core Rules

- Never read the full upload into memory
- Stream uploads to disk in chunks
- Enforce size during streaming
- Normalize media with ffmpeg from disk
- Keep normalized working assets temporary
- Clean temp files in `finally` blocks

## Why This Matters

Paid users may upload files as large as 1 GB.

That means RAM-heavy shortcuts are dangerous:
- `await file.read()` on the whole file is not acceptable
- giant base64 response payloads are not acceptable
- analysis should operate on bounded normalized assets

## Working Approach

1. Authenticate user
2. Resolve plan profile
3. Stream upload to temp file
4. Probe media
5. Enforce duration limits if needed
6. Normalize media for analysis
7. Run pipeline
8. Record usage
9. Cleanup temp assets