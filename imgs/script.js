function makeDraggable(element, handleElement) {
    const children = element.querySelectorAll(`*:not(#${handleElement.id})`);
    let offsetX, offsetY;

    function getEventCoordinates(event) {
        let x, y;
        if (event.type.startsWith('touch')) {
            const touch = event.touches[0] || event.changedTouches[0];
            x = touch.clientX;
            y = touch.clientY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
        return { x, y };
    }

    function startDragging(event) {
        const windowRect = {
            top: 0,
            right: window.innerWidth || document.documentElement.clientWidth,
            bottom: window.innerHeight || document.documentElement.clientHeight,
            left: 0
        };

        if (handleElement !== event.target && !handleElement.contains(event.target)) {
            return;
        }

        const elementProps = window.getComputedStyle(element);
        const { x, y } = getEventCoordinates(event);
        offsetX = x - parseInt(elementProps.left);
        offsetY = y - parseInt(elementProps.top);

        function moveHandler(event) {
            const { x, y } = getEventCoordinates(event);

            let newTop = y - offsetY;
            let newLeft = x - offsetX;

            if (newTop < 0) {
                newTop = 0;
            } else if (newTop + element.offsetHeight > windowRect.bottom) {
                newTop = windowRect.bottom - element.offsetHeight;
            }

            if (newLeft < 0) {
                newLeft = 0;
            } else if (newLeft + element.offsetWidth > windowRect.right) {
                newLeft = windowRect.right - element.offsetWidth;
            }

            element.style.top = newTop + 'px';
            element.style.left = newLeft + 'px';
        }

        function endDragging() {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('touchmove', moveHandler);
            window.removeEventListener('mouseup', endDragging);
            window.removeEventListener('touchend', endDragging);

            children.forEach(c => c.classList.remove('unselectable'));
            handleElement.classList.remove('moving');
        }

        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('touchmove', moveHandler);
        window.addEventListener('mouseup', endDragging);
        window.addEventListener('touchend', endDragging);

        children.forEach(c => c.classList.add('unselectable'));
        handleElement.classList.add('moving');
    }

    handleElement.addEventListener('mousedown', startDragging);
    handleElement.addEventListener('touchstart', startDragging);
}


function waitForElementToExist(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            subtree: true,
            childList: true,
        });
    });
}

function isOverflowing(element) {
    const windowRect = {
        top: 0,
        right: window.innerWidth || document.documentElement.clientWidth,
        bottom: window.innerHeight || document.documentElement.clientHeight,
        left: 0
    };
    const rect = element.getBoundingClientRect();
    let isOverflowingTop = rect.top < windowRect.top;
    let isOverflowingLeft = rect.left < windowRect.left;
    let isOverflowingRight = rect.right > windowRect.right;
    let isOverflowingBottom = rect.bottom > windowRect.bottom;

    for (const child of element.children) {
        const childRect = child.getBoundingClientRect();

        isOverflowingTop |= childRect.top < 0;
        isOverflowingLeft |= childRect.left < 0;
        isOverflowingRight |= childRect.right > windowRect.right;
        isOverflowingBottom |= childRect.bottom > windowRect.bottom;
    }

    return {
        overflowTop: isOverflowingTop,
        overflowLeft: isOverflowingLeft,
        overflowRight: isOverflowingRight,
        overflowBottom: isOverflowingBottom
    };
}

function handleIframeOverflow(element) {
    console.log(parseInt(element.height))
    if (parseInt(element.height) > 70 || element.height === '100%') {
        element.classList.add('web_chat_panel');
    } else {
        element.classList.remove('web_chat_panel');
    }
    const parentElement = element.parentNode;
    const overflowStatus = isOverflowing(parentElement);
    if (overflowStatus.overflowTop) {
        const heightDifference = element.offsetHeight - parentElement.offsetHeight;
        parentElement.style.top = `${heightDifference}px`;
    }
    if (overflowStatus.overflowLeft) {
        const widthDifference = element.offsetWidth - parentElement.offsetWidth - 163;
        parentElement.style.left = `${widthDifference}px`;
    }
    if(overflowStatus.overflowBottom) {
        parentElement.style.removeProperty('top');
    }
    if(overflowStatus.overflowRight) {
        parentElement.style.removeProperty('left');
    }
}

function handleSizeChange(entries) {
    entries.forEach(entry => {
        handleIframeOverflow(entry.target);
    });
}

async function chatbotIframeEvenListeners() {
    await waitForElementToExist('#Microsoft_Omnichannel_LCWidget_Chat_Iframe_Window');
    const iframe = document.querySelector('#Microsoft_Omnichannel_LCWidget_Chat_Iframe_Window');

    iframe.addEventListener('load', function () {
        if (!iframe.style.position) {
            iframe.removeEventListener('load', this);
            return;
        }
        iframe.style.removeProperty('position');
        const iframeContainer = document.createElement('div');
        iframeContainer.setAttribute('id', 'iframe-container');
        iframeContainer.appendChild(iframe);

        const handleIcon = document.createElement('div');
        handleIcon.id = 'handle-icon';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('id', 'test');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'm16.1924 5.65683c.3905-.39053.3905-1.02369 0-1.41422l-2.8284-2.82842c-.7811-.781051-2.0474-.781053-2.8285 0l-2.82839 2.82842c-.39053.39053-.39053 1.02369 0 1.41422.39052.39052 1.02368.39052 1.41421 0l1.87868-1.87871v7.27218h-7.27216l1.87871-1.87873c.39052-.39053.39052-1.02369 0-1.41422-.39053-.39052-1.02369-.39052-1.41421 0l-2.82843 2.82845c-.781047.781-.781051 2.0474 0 2.8284l2.82843 2.8284c.39052.3906 1.02369.3906 1.41421 0 .39052-.3905.39052-1.0236 0-1.4142l-1.77815-1.7781h7.1716v7.1716l-1.87868-1.8787c-.39053-.3906-1.02369-.3906-1.41422 0-.39052.3905-.39052 1.0237 0 1.4142l2.8284 2.8284c.7811.7811 2.0474.7811 2.8285 0l2.8284-2.8284c.3905-.3905.3905-1.0237 0-1.4142-.3905-.3906-1.0237-.3906-1.4142 0l-1.7782 1.7781v-7.071h7.071l-1.7781 1.7781c-.3905.3906-.3905 1.0237 0 1.4142.3905.3906 1.0237.3906 1.4142 0l2.8284-2.8284c.7811-.781.7811-2.0474 0-2.8284l-2.8284-2.82845c-.3905-.39052-1.0237-.39052-1.4142 0-.3905.39053-.3905 1.02369 0 1.41422l1.8787 1.87873h-7.1716v-7.17163l1.7782 1.77816c.3905.39052 1.0237.39052 1.4142 0z');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '0.1');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');

        svg.appendChild(path);
        handleIcon.appendChild(svg);
        iframeContainer.appendChild(handleIcon);
        handleIcon.style.display='block';
        document.body.appendChild(iframeContainer);

        makeDraggable(iframeContainer, handleIcon);

        // const resizeObserver = new ResizeObserver(handleSizeChange);
        // resizeObserver.observe(iframe);

        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'height') {
                    handleIframeOverflow(iframe);
                }
            }
        });
        const config = { attributes: true, attributeOldValue: true };
        observer.observe(iframe, config);

        // const insetObserver = new MutationObserver((mutationsList, observer) => {
        //     for (let mutation of mutationsList) {
        //         if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        //             const oldStyle = mutation.oldValue;
        //             const newStyle = iframe.style.cssText;
        //             if (oldStyle.includes('inset') && !newStyle.includes('inset')) {
        //                 handleIframeOverflow(iframe);
        //             }
        //         }
        //     }
        // });
        // const configObserver = { attributes: true, attributeOldValue: true };
        // insetObserver.observe(iframe, configObserver);

    });

    window.addEventListener('resize', () => {
        handleIframeOverflow(iframe);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chatbotIframeEvenListeners();
});