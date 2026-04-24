# Analysis Flow

## Request Lifecycle

1. Client uploads media to `/analysis/`
2. User is authenticated
3. User plan and account status are resolved
4. Current usage/quota state is checked
5. Upload is streamed to a temp file on disk
6. Upload size is enforced during streaming
7. Media is probed with `ffprobe`
8. Media is normalized with `ffmpeg`
9. Analysis pipeline runs on normalized audio
10. Final response is shaped according to the resolved plan profile
11. Usage is recorded
12. Temp files are cleaned up

## Design Goals

- Keep routes thin
- Keep plan logic centralized
- Keep large file handling disk-based
- Keep response shaping separate from core analysis logic