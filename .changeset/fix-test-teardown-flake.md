---
'@unbranded-ds/react': patch
---

Fix an intermittent unit-test crash. The suite occasionally failed with "window is not defined" after the jsdom environment was disposed, because a component left mounted at teardown let React's scheduler fire a queued callback against a window that was already gone. The setup file now unmounts each test's tree, so that work runs while the window is still alive. No change to shipped components.
