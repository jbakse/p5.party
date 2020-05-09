- Reorg as library/module

- Should shared spritelisten to the canvas events directly?

  - This would let all the events handlers be private

- handle this automatically removing owned sprites when owner leaves automatically?
- get rid of private member access! javascript doesn't enforce this, but we shouldn't do it!

- todo, shouldn't rely on globals for ds, spriteManager

- attach/detach lifecyle events

- mouseClicked + all other mouse events

* todo organize record

  - record
    - creator
    - owner
    - shared
      - x
      - y
      - w
      - h
      - z

* populate data field differently

  - change name to `shared`
  - put `shared` on the components
  - components can just read e.g. this.shared.x
  - components can just write e.g. this.shared.x, changes will be shared automatically
  - add function to cause immediate sync-write
  - allow to configure sync-write frequency

* make it so you don't have to forward all the events

- add broadcast event function on sharedSpriteManager.js

- use actually unique id's for client ids

- use "#" for privates
