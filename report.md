problem a:- Intelli CLI login currently uses terminal prompt instead of browser-based authentication loop like the code CLI => ok
solution a:- Implemented browser-based authentication flow with local loopback callback server on port 9877, HTML success landing page, and token storage in dot inqlab intelli.json matching the code CLI pattern.

problem b:- Interactive prompts and output in Intelli CLI use raw console calls instead of consola design system => ok
solution b:- Replaced raw console and readline prompts with consola interactive prompts, structured status boxes, and error reporting across all intelli commands.
