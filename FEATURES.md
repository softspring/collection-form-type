# Collection Form Type Features

Functional definition for `softspring/collection-form-type`.

This file defines the expected behavior and functional scope of the package. It describes what the package must provide to Symfony applications that use dynamic collection form UIs in the browser.

## Purpose

- Provide reusable browser-side behavior for dynamic collection forms.
- Reduce repeated JavaScript work around add, insert, move, duplicate, copy, paste, and delete actions.
- Give Symfony projects a common event-based contract for collection form interactions.

## Main Features

- Initialize collection behavior on DOM elements marked with `data-collection="collection"`.
- Support collection actions through `data-collection-action`.
- Support these actions:
  - add
  - insert
  - delete
  - up
  - down
  - duplicate
  - copy
  - paste
- Keep collection indexes, ids, and full names synchronized when nodes move or duplicate.
- Update action button visibility after collection changes.
- Scroll newly added or inserted nodes into view.
- Propagate current input values into HTML before moving nodes.
- Support clipboard-based copy and paste of collection nodes.

## Event Expectations

- Dispatch collection lifecycle events before and after each operation.
- Allow applications to intercept and customize collection behavior through DOM events.
- Provide collection context such as:
  - collection
  - node
  - position
  - prototype
  - prototype name

## Expected Usage

- Import the package JavaScript into the application asset build.
- Mark collections and nodes with the expected `data-collection` attributes.
- Provide collection prototypes through data attributes on the collection or action element.
- Use the dispatched events to add application-specific behavior when needed.

## Integration Expectations

- Work well with Symfony collection form patterns that render HTML prototypes.
- Compose with custom Twig form themes and admin UIs.
- Fit the collection-based editing patterns used by `cms-bundle` and related packages.

## Extension Expectations

- Applications should be able to listen to the emitted DOM events and extend behavior without forking the package.
- Applications should be able to validate clipboard payloads before paste.
- Applications should be able to customize add and insert flows by changing the prototype or target position during `before` events.

## Current Limits

- The package is browser-side JavaScript and does not provide a PHP form type.
- It depends on HTML data attributes and generated collection prototypes being present and correct.
- Clipboard features depend on browser support and permissions.
