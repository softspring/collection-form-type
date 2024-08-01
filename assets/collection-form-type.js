class CollectionEvent extends Event {
    constructor(type, originEvent) {
        super(type, { bubbles: true, cancelable: true });
        this._originEvent = originEvent;
        this._collection = undefined;
        this._position = undefined;
        this._node = undefined;
        this._prototypeName = undefined;
        this._prototype = undefined;
    }

    static create(type, originEvent) {
        const newEvent = new CollectionEvent(type, originEvent);

        if (originEvent._collection !== undefined) {
            newEvent.collection(originEvent._collection);
        }

        if (originEvent._node !== undefined) {
            newEvent.node(originEvent._node);
        }

        if (originEvent._position !== undefined) {
            newEvent.position(originEvent._position);
        }

        if (originEvent._prototype !== undefined) {
            newEvent.prototype(originEvent._prototype);
        }

        if (originEvent._prototypeName !== undefined) {
            newEvent.prototypeName(originEvent._prototypeName);
        }

        return newEvent;
    }

    originEvent() {
        return this._originEvent;
    }

    collection(collection) {
        if (collection !== undefined) {
            this._collection = collection;
        }

        if (this._collection) {
            return this._collection;
        } else if (!this.target) {
            return null;
        } else if (this.target.dataset.collectionTarget !== undefined) {
            return document.getElementById(this.target.dataset.collectionTarget);
        } else if (this.target.dataset.collection === 'collection') {
            return this.target;
        } else {
            const collection = this.target.closest('[data-collection=collection]');

            if (!collection) {
                throw 'Collection not found';
            }

            return collection;
        }
    }

    position(position) {
        if (position !== undefined) {
            this._position = position;
        }

        if (this._position !== undefined) {
            return this._position;
        } else if (this.target.dataset.collectionInsertPosition !== undefined) {
            return this.target.dataset.collectionInsertPosition;
        } else {
            let node = this.node();

            if (node && node.dataset.index !== undefined) {
                return node.dataset.index;
            }

            return null;
        }
    }

    node(node) {
        if (node !== undefined) {
            this._node = node;
        }

        if (this._node !== undefined) {
            return this._node;
        } else if (event.target.dataset.collectionNode !== undefined) {
            return document.getElementById(event.target.dataset.collectionNode);
        } else {
            return event.target.closest('[data-collection=node]');
        }
    }

    prototypeName(prototypeName) {
        if (prototypeName !== undefined) {
            this._prototypeName = prototypeName;
        }

        if (this._prototypeName) {
            return this._prototypeName;
        } else if (this.target.dataset.collectionPrototypeName !== undefined) {
            return this.target.dataset.collectionPrototypeName;
        } else if (this.collection().dataset.prototypeName !== undefined) {
            return this.collection().dataset.prototypeName;
        } else {
            console.log('This target does not contains data-collection-prototype-name attribute, neither was set');
            return null;
        }
    }

    prototype(prototype) {
        if (prototype !== undefined) {
            this._prototype = prototype;
        }

        if (this._prototype) {
            return this._prototype;
        } else if (this.target.dataset.prototype !== undefined) {
            return this.target.dataset.prototype;
        } else if (this.collection().dataset.prototype !== undefined) {
            return this.collection().dataset.prototype;
        } else {
            console.log('This target does not contains data-collection-prototype attribute, neither was set');
            return null;
        }
    }
}

window.addEventListener('load', (event) => {

    // IMPORTANT, STORE INPUT VALUES INTO HTML FOR MOVING NODES BEFORE MOVE TO PREVENT LOOSING VALUE !!
    document.addEventListener("change", function (event) {
        if (!event.target) return;

        if (event.target.matches('[data-collection=node] input[type=radio]')) {
            event.target.setAttribute('checked', event.target.checked ? 'checked' : '');
            return;
        }

        if (event.target.matches('[data-collection=node] input[type=checkbox]')) {
            event.target.setAttribute('checked', event.target.checked ? 'checked' : '');
            return;
        }

        if (event.target.matches('[data-collection=node] select')) {
            [...event.target.options].forEach((option) => option.removeAttribute('selected'));
            event.target.options[event.target.selectedIndex].setAttribute('selected', 'selected');
            return;
        }

        if (event.target.matches('[data-collection=node] input')) {
            event.target.setAttribute('value', event.target.value);
        }
    });

    /* ************************************************************************************************************* *
     * CUSTOM COLLECTION ACTION EVENTS
     * ************************************************************************************************************* */
    document.addEventListener("click", function (event) {
        let collectionActionTarget = event.target;
        if (!event.target) return;

        if (!event.target.hasAttribute('data-collection-action')) {
            // check if parent class is an action
            collectionActionTarget = event.target.closest('[data-collection-action]')
            if (!collectionActionTarget) return;
        }

        if (collectionActionTarget.dataset.collectionAction === 'add') {
            collectionActionTarget.dispatchEvent(new CollectionEvent('collection.node.add', event));
            return;
        }

        if (collectionActionTarget.dataset.collectionAction === 'insert') {
            collectionActionTarget.dispatchEvent(new CollectionEvent('collection.node.insert', event));
            return;
        }

        if (collectionActionTarget.dataset.collectionAction === 'delete') {
            collectionActionTarget.dispatchEvent(new CollectionEvent('collection.node.delete', event));
            return;
        }

        if (collectionActionTarget.dataset.collectionAction === 'up') {
            collectionActionTarget.dispatchEvent(new CollectionEvent('collection.node.up', event));
            return;
        }

        if (collectionActionTarget.dataset.collectionAction === 'down') {
            collectionActionTarget.dispatchEvent(new CollectionEvent('collection.node.down', event));
            return;
        }

        if (collectionActionTarget.dataset.collectionAction === 'duplicate') {
            collectionActionTarget.dispatchEvent(new CollectionEvent('collection.node.duplicate', event));
            return;
        }

        console.error('Invalid collection action: '+collectionActionTarget.dataset.collectionAction+'. Valid options are: add, insert, delete, up, down, duplicate');
    });

    /**
     * Default collection.node.add event listener
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.add", function (event) {
        event.preventDefault();

        let beforeEvent = CollectionEvent.create('collection.node.add.before', event);
        beforeEvent.node(null); // init node, do not search in dom because it's not yet created
        event.target.dispatchEvent(beforeEvent);

        // do add collection node with beforeEvent returned data
        const newNode = addCollectionNode(beforeEvent.collection(), beforeEvent.prototypeName(), beforeEvent.prototype());

        const afterEvent = CollectionEvent.create('collection.node.add.after', beforeEvent);
        afterEvent.node(newNode);
        beforeEvent.collection().dispatchEvent(afterEvent);
    });

    /**
     * Default collection.node.insert event listener
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.insert", function (event) {
        event.preventDefault();

        let beforeEvent = CollectionEvent.create('collection.node.insert.before', event);
        event.target.dispatchEvent(beforeEvent);

        // do insert collection node with beforeEvent returned data
        const newNode = insertAfterCollectionNode(beforeEvent.collection(), beforeEvent.prototypeName(), beforeEvent.prototype(), beforeEvent.position());

        if (newNode.nextElementSibling) {
            const nodes = [...beforeEvent.collection().querySelectorAll(':scope > [data-collection=node]')];
            for (let n = nodes.indexOf(newNode)+1 ; n < nodes.length ; n++) {
                modifyIndexes(nodes[n], +1);
            }
        }

        const afterEvent = CollectionEvent.create('collection.node.insert.after', beforeEvent);
        afterEvent.node(newNode);
        beforeEvent.collection().dispatchEvent(afterEvent);
    });

    /**
     * Default collection.node.delete event listener
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.delete", function (event) {
        event.preventDefault();

        let beforeEvent = CollectionEvent.create('collection.node.delete.before', event);
        event.target.dispatchEvent(beforeEvent);
        beforeEvent.collection(beforeEvent.collection()); // store reference before deleting

        // do delete collection node with beforeEvent returned data
        deleteCollectionNode(beforeEvent.collection(), beforeEvent.node());

        const afterEvent = CollectionEvent.create('collection.node.delete.after', beforeEvent);
        afterEvent.collection().dispatchEvent(afterEvent);
    });

    /**
     * Default collection.node.up event listener
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.up", function (event) {
        event.preventDefault();

        let beforeEvent = CollectionEvent.create('collection.node.up.before', event);
        event.target.dispatchEvent(beforeEvent);
        beforeEvent.collection(beforeEvent.collection()); // store reference before moving
        beforeEvent.node(beforeEvent.node()); // store reference before moving

        // do up collection node with beforeEvent returned data
        moveUpCollectionNode(beforeEvent.collection(), beforeEvent.node());

        const afterEvent = CollectionEvent.create('collection.node.up.after', beforeEvent);
        beforeEvent.collection().dispatchEvent(afterEvent);
    });

    /**
     * Default collection.node.down event listener
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.down", function (event) {
        event.preventDefault();

        let beforeEvent = CollectionEvent.create('collection.node.down.before', event);
        event.target.dispatchEvent(beforeEvent);
        beforeEvent.collection(beforeEvent.collection()); // store reference before moving
        beforeEvent.node(beforeEvent.node()); // store reference before moving

        // do up collection node with beforeEvent returned data
        moveDownCollectionNode(beforeEvent.collection(), beforeEvent.node());

        const afterEvent = CollectionEvent.create('collection.node.down.after', beforeEvent);
        beforeEvent.collection().dispatchEvent(afterEvent);
    });

    /**
     * Default collection.node.duplicate event listener
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.duplicate", function (event) {
        event.preventDefault();

        let beforeEvent = CollectionEvent.create('collection.node.duplicate.before', event);
        event.target.dispatchEvent(beforeEvent);
        beforeEvent.collection(beforeEvent.collection()); // store reference before moving
        beforeEvent.node(beforeEvent.node()); // store reference before moving

        // do up collection node with beforeEvent returned data
        let newNode = duplicateCollectionNode(beforeEvent.collection(), beforeEvent.node());

        if (newNode.nextElementSibling) {
            const nodes = [...beforeEvent.collection().querySelectorAll(':scope > [data-collection=node]')];
            for (let n = nodes.indexOf(newNode)+1 ; n < nodes.length ; n++) {
                modifyIndexes(nodes[n], +1);
            }
        }

        const afterEvent = CollectionEvent.create('collection.node.duplicate.after', beforeEvent);
        afterEvent.node(newNode);
        beforeEvent.collection().dispatchEvent(afterEvent);
    });


    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.add.after", function (event) {
        updateCollectionButtons(event.collection());
    });

    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.insert.after", function (event) {
        updateCollectionButtons(event.collection());
    });

    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.delete.after", function (event) {
        updateCollectionButtons(event.collection());
    });

    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.up.after", function (event) {
        updateCollectionButtons(event.collection());
    });

    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.down.after", function (event) {
        updateCollectionButtons(event.collection());
    });

    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.duplicate.after", function (event) {
        updateCollectionButtons(event.collection());
    });

    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.add.after", function (event) {
        event.node().scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    });

    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.insert.after", function (event) {
        event.node().scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    });

    /**
     * @param {CollectionEvent} event
     */
    document.addEventListener("collection.node.duplicate.after", function (event) {
        event.node().scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    });


    // on load, prepare buttons
    document.querySelectorAll('[data-collection=collection]').forEach((collection) => updateCollectionButtons(collection));
});

function insertAfterCollectionNode (collection, prototypeName, prototype, position) {
    // create and process prototype
    let newNode = document.createElement('div');

    // append node to form
    const currentElementAtPosition = collection.querySelector(':scope > [data-collection=node][data-index="'+position+'"]');
    if (currentElementAtPosition) {
        newNode = collection.insertBefore(newNode, currentElementAtPosition);
    } else {
        if (collection.children.length > 0) {
            newNode = collection.insertBefore(newNode, collection.children[collection.children.length-1]);
        } else {
            newNode = collection.appendChild(newNode);
        }
    }

    newNode.outerHTML = prototype.replace(new RegExp(prototypeName, 'g'), position);

    // select the node again to update JS structure reference variables
    return collection.querySelector([':scope > [data-index="'+position+'"]']);
}

function addCollectionNode (collection, prototypeName, prototype) {
    const lastIndex = getCollectionLastIndex(collection);
    const index = isNaN(lastIndex) ? 0 : lastIndex+1;

    // create and process prototype
    let newNode = document.createElement('div');

    // append node to form
    newNode = collection.appendChild(newNode);
    newNode.outerHTML = prototype.replace(new RegExp(prototypeName, 'g'), index);

    // select the node again to update JS structure reference variables
    return collection.querySelector([':scope > [data-index="'+index+'"]']);
}

function deleteCollectionNode (collection, node) {
    let nodeIterator = node;
    while (nodeIterator = nodeIterator.nextElementSibling) {
        if ( nodeIterator.matches('[data-collection=node]') ) {
            modifyIndexes(nodeIterator, -1);
        }
    }

    node.remove();
}

function moveUpCollectionNode(collection, node) {
    const nodes = [...collection.querySelectorAll(':scope > [data-collection=node]')];
    const currentNodeIndex = nodes.indexOf(node);

    if (nodes[currentNodeIndex-1] !== undefined) {
        const prevNode = nodes[currentNodeIndex-1];
        prevNode.parentNode.insertBefore(node, prevNode);
        modifyIndexes(node, -1);
        modifyIndexes(prevNode, +1);
    }
}

function moveDownCollectionNode(collection, node) {
    const nodes = [...collection.querySelectorAll(':scope > [data-collection=node]')];
    const currentNodeIndex = nodes.indexOf(node);

    if (nodes[currentNodeIndex+1] !== undefined) {
        const nextNode = nodes[currentNodeIndex+1];
        node.parentNode.insertBefore(nextNode, node);
        modifyIndexes(node, +1);
        modifyIndexes(nextNode, -1);
    }
}

function duplicateCollectionNode(collection, node) {
    let newNode = node.cloneNode(true);
    const nextNode = node.nextElementSibling;

    if (nextNode) {
        nextNode.parentNode.insertBefore(newNode, nextNode);
    } else {
        // it last node
        collection.appendChild(newNode);
    }

    modifyIndexes(newNode, +1);

    return newNode;
}

function getCollectionLastIndex(collection) {
    const nodeList = collection.querySelectorAll('[data-collection=node]');

    if (!nodeList.length) {
        return -1;
    }

    return parseInt(nodeList.item(nodeList.length - 1).dataset.index);
}

// DUPLICATES softspring/cms-bundle assets form-collection.js
function modifyIndexes(rowElement, increment) {
    let oldIndex = parseInt(rowElement.dataset.index);
    let newIndex = oldIndex + increment;
    rowElement.dataset.index = newIndex;
    rowElement.setAttribute('data-index', newIndex);
    rowElement.querySelectorAll('[data-collection=node-index]').forEach((nodeIndex) => nodeIndex.innerHTML = newIndex);

    let oldRowId = rowElement.getAttribute('id');
    rowElement.setAttribute('id', replaceLastOccurence(rowElement.getAttribute('id'), '_'+oldIndex, '_'+newIndex));
    let newRowId = rowElement.getAttribute('id');

    let oldRowFullName = rowElement.getAttribute('data-full-name');
    rowElement.setAttribute('data-full-name', replaceLastOccurence(rowElement.getAttribute('data-full-name'), '['+oldIndex+']', '['+newIndex+']'));
    let newRowFullName = rowElement.getAttribute('data-full-name');

    rowElement.innerHTML = rowElement.innerHTML.replaceAll(oldRowId, newRowId).replaceAll(oldRowFullName, newRowFullName);
}

function replaceLastOccurence(text, search, replace) {
    if (!text) {
        return text;
    }

    let lastIndex = text.lastIndexOf(search);
    return text.substr(0, lastIndex) + text.substr(lastIndex).replace(search, replace);
}

function updateCollectionButtons(collection) {
    const innerCollectionUpButtons = [...collection.querySelectorAll(':scope > [data-collection=node] [data-collection=node] [data-collection-action=up]')];
    const collectionUpButtons = [...collection.querySelectorAll(':scope > [data-collection=node] [data-collection-action=up]')].filter((button) => !innerCollectionUpButtons.includes(button));
    collectionUpButtons.forEach((button) => button.classList.remove('d-none'));
    collectionUpButtons.length>0 && collectionUpButtons[0].classList.add('d-none');

    const innerCollectionDownButtons = [...collection.querySelectorAll(':scope > [data-collection=node] [data-collection=node] [data-collection-action=down]')];
    const collectionDownButtons = [...collection.querySelectorAll(':scope > [data-collection=node] [data-collection-action=down]')].filter((button) => !innerCollectionDownButtons.includes(button));
    collectionDownButtons.forEach((button) => button.classList.remove('d-none'));
    collectionDownButtons.length>0 && collectionDownButtons[collectionDownButtons.length-1].classList.add('d-none');
}

export {
    insertAfterCollectionNode,
    addCollectionNode,
    deleteCollectionNode,
    moveUpCollectionNode,
    moveDownCollectionNode,
    getCollectionLastIndex,
    modifyIndexes,
    replaceLastOccurence,
    updateCollectionButtons
};

// DEBUG EVENTS
// window.addEventListener('load', (event) => {
//     function dumpEvent(event) {
//         console.log('*************************************** '+event.type+' ***************************************');
//         console.log(event);
//         // try { console.log('originEvent: '+ event.originEvent()); } catch {}
//         try { console.log(event.collection()); } catch {}
//         try { console.log('position: '+ event.position()); } catch {}
//         try { console.log(event.node()); } catch {}
//         // try { console.log('prototypeName: '+ event.prototypeName()); } catch {}
//         // try { console.log('prototype: '+ event.prototype()); } catch {}
//     }
//
//     // document.addEventListener('collection.node.add', dumpEvent);
//     document.addEventListener('collection.node.add.before', dumpEvent);
//     document.addEventListener('collection.node.add.after', dumpEvent);
//
//     // document.addEventListener('collection.node.insert', dumpEvent);
//     document.addEventListener('collection.node.insert.before', dumpEvent);
//     document.addEventListener('collection.node.insert.after', dumpEvent);
//
//     // document.addEventListener('collection.node.delete', dumpEvent);
//     document.addEventListener('collection.node.delete.before', dumpEvent);
//     document.addEventListener('collection.node.delete.after', dumpEvent);
//
//     // document.addEventListener('collection.node.up', dumpEvent);
//     document.addEventListener('collection.node.up.before', dumpEvent);
//     document.addEventListener('collection.node.up.after', dumpEvent);
//
//     // document.addEventListener('collection.node.down', dumpEvent);
//     document.addEventListener('collection.node.down.before', dumpEvent);
//     document.addEventListener('collection.node.down.after', dumpEvent);
// });
