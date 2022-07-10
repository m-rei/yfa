# Problem

Checking youtube subscriptions updates across multiple accounts in one place, instead of having to switch accounts and waitign for load times

# Solution

Angular project with...:

- account management
  - add
  - remove
  - rename
  - order id
- subscription management
  - select account
    - add channel
    - remove channel
- tab view
  - all, always rendered
  - account 1 .. n
  - refresh button with progress bar and cancel functionality
    	- only when account # > 0
    	- renders over view, locking it
- persisted in local storage

# TODO

- compression for localstorage persistence:
  - dont persist jsons, but CSV for channels
    - so instead of: [{"account":"fun","id":"UC1v2bdQblPEcYdoKuJtY0lA","name":"Anna's Analysis"}]
    - just use: fun|UC1v2bdQblPEcYdoKuJtY0lA|Anna's Analysis
    - and gzip & b64