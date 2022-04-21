import ReactDOM from 'react-dom';

const instanceConfig = {};

export function updateStateListener(data) {
    postState(data);
}

function postState(data) {
    window.parent.postMessage(
        {
            instanceId: instanceConfig.instanceId,
            state: data,
        },
        '*',
    );
}

export function listenToParentIPC() {
    window.addEventListener('message', (e) => {
        instanceConfig.instanceId = e.data.instanceId;

        postState();
    });
}

export function render(elem) {
    document.addEventListener('DOMContentLoaded', () => {
        ReactDOM.render(elem, document.body);
    });
}
