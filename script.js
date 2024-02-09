function start() {
    waitForElementToExist('#Microsoft_Omnichannel_LCWidget_Chat_Iframe_Window', init);
}

function waitForElementToExist(selector, callback) {
    if (document.querySelector(selector)) {
        callback();
        return;
    }
    var observer = new MutationObserver(function () {
        if (document.querySelector(selector)) {
            callback();
            observer.disconnect();
        }
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
    });
}

function init() {
    var iframe = document.querySelector('#Microsoft_Omnichannel_LCWidget_Chat_Iframe_Window');

    iframe.addEventListener('load', function () {
        if (!iframe.style.position) {
            iframe.removeEventListener('load', this);
            return;
        }
        iframe.style.removeProperty('position');
        var iframeContainer = document.createElement('div');
        iframeContainer.setAttribute('id', 'iframe-container');
        iframeContainer.appendChild(iframe);

        var handleIcon = document.createElement('div');
        handleIcon.id = 'handle-icon';

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('id', 'test');

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'm16.1924 5.65683c.3905-.39053.3905-1.02369 0-1.41422l-2.8284-2.82842c-.7811-.781051-2.0474-.781053-2.8285 0l-2.82839 2.82842c-.39053.39053-.39053 1.02369 0 1.41422.39052.39052 1.02368.39052 1.41421 0l1.87868-1.87871v7.27218h-7.27216l1.87871-1.87873c.39052-.39053.39052-1.02369 0-1.41422-.39053-.39052-1.02369-.39052-1.41421 0l-2.82843 2.82845c-.781047.781-.781051 2.0474 0 2.8284l2.82843 2.8284c.39052.3906 1.02369.3906 1.41421 0 .39052-.3905.39052-1.0236 0-1.4142l-1.77815-1.7781h7.1716v7.1716l-1.87868-1.8787c-.39053-.3906-1.02369-.3906-1.41422 0-.39052.3905-.39052 1.0237 0 1.4142l2.8284 2.8284c.7811.7811 2.0474.7811 2.8285 0l2.8284-2.8284c.3905-.3905.3905-1.0237 0-1.4142-.3905-.3906-1.0237-.3906-1.4142 0l-1.7782 1.7781v-7.071h7.071l-1.7781 1.7781c-.3905.3906-.3905 1.0237 0 1.4142.3905.3906 1.0237.3906 1.4142 0l2.8284-2.8284c.7811-.781.7811-2.0474 0-2.8284l-2.8284-2.82845c-.3905-.39052-1.0237-.39052-1.4142 0-.3905.39053-.3905 1.02369 0 1.41422l1.8787 1.87873h-7.1716v-7.17163l1.7782 1.77816c.3905.39052 1.0237.39052 1.4142 0z');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '0.1');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');

        svg.appendChild(path);
        handleIcon.appendChild(svg);
        iframeContainer.appendChild(handleIcon);

        document.body.appendChild(iframeContainer);
        makeDraggable(iframeContainer, handleIcon);

        var resizeObserver = new ResizeObserver(handleSizeChange);
        resizeObserver.observe(iframe);
    });

    window.addEventListener('resize', function () {
        handleIframeOverflow(iframe);
    });
}

function makeDraggable(element, handleElement) {
    var children = element.querySelectorAll('*:not(#' + handleElement.id + ')');

    element.addEventListener('mousedown', function (e) {
        var windowRect = {
            top: 0,
            right: window.innerWidth || document.documentElement.clientWidth,
            bottom: window.innerHeight || document.documentElement.clientHeight,
            left: 0
        };
        if (handleElement !== e.target && !handleElement.contains(e.target)) {
            return;
        }
        Array.prototype.forEach.call(children, function (c) {
            c.classList.add('unselectable');
        });
        handleElement.classList.add('moving');
        var elementProps = window.getComputedStyle(element);
        var offsetX = e.clientX - parseInt(elementProps.left),
            offsetY = e.clientY - parseInt(elementProps.top);

        function handleMouseMove(e) {
            if (e.clientY - offsetY < 0) {
                element.style.top = 0 + 'px';
            } else if (parseInt(elementProps.height) + e.clientY - offsetY + 16 > windowRect.bottom) {
                element.style.removeProperty('top');
            } else {
                element.style.top = (e.clientY - offsetY) + 'px';
            }

            if (e.clientX - offsetX < 0) {
                element.style.left = 0 + 'px';
            } else if (e.clientX - offsetX + 240 > windowRect.right) {
                element.style.removeProperty('left');
            } else {
                element.style.left = (e.clientX - offsetX) + 'px';
            }
        }

        function handleMouseUp(e) {
            window.removeEventListener('mousemove', handleMouseMove, false);
            Array.prototype.forEach.call(children, function (c) {
                c.classList.remove('unselectable');
            });
            handleElement.classList.remove('moving');
        }

        window.addEventListener('mousemove', handleMouseMove, false);
        window.addEventListener('mouseup', handleMouseUp, false);
    }, false);
}

function isOverflowing(element) {
    var windowRect = {
        top: 0,
        right: window.innerWidth || document.documentElement.clientWidth,
        bottom: window.innerHeight || document.documentElement.clientHeight,
        left: 0
    };
    var rect = element.getBoundingClientRect();
    var isOverflowingTop = rect.top < windowRect.top;
    var isOverflowingLeft = rect.left < windowRect.left;
    var isOverflowingRight = rect.right > windowRect.right;
    var isOverflowingBottom = rect.bottom > windowRect.bottom;

    for (var i = 0; i < element.children.length; i++) {
        var childRect = element.children[i].getBoundingClientRect();

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
    var parentElement = element.parentNode;
    var overflowStatus = isOverflowing(parentElement);
    if (overflowStatus.overflowTop) {
        var heightDifference = element.offsetHeight - parentElement.offsetHeight;
        parentElement.style.top = heightDifference + 'px';
    }
    if (overflowStatus.overflowLeft) {
        var widthDifference = element.offsetWidth - parentElement.offsetWidth - 163;
        parentElement.style.left = widthDifference + 'px';
    }
    if (overflowStatus.overflowBottom) {
        parentElement.style.removeProperty('top');
    }
    if (overflowStatus.overflowRight) {
        parentElement.style.removeProperty('left');
    }
}

function handleSizeChange(entries) {
    for (var i = 0; i < entries.length; i++) {
        handleIframeOverflow(entries[i].target);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    start();
});
