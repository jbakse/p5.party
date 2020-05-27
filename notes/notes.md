https://deepstream.io/

https://github.com/deepstreamIO/ds-demo-heroku

https://deepstream-server-1.herokuapp.com/

https://github.com/processing/p5.js/blob/master/contributor_docs/creating_libraries.md

https://elements.heroku.com/addons/autoidle

# Hello

Sometimes a client "unexpectedly leaves" because ds reconnects them (not sure why).
They get removed from the room and then we don't know they are there, but they are still there because they auto reconnect.
possible fixes

- mark them as missing and reconnect them if they reapear.
- can we have a client readd _themselves_ to room on autoreconnect
- don't remove participants on unexpected leave?
- remove them, but after time delay?
