/*!
 * Accordion v2.5.1
 * Simple accordion created in pure Javascript.
 * https://github.com/michu2k/Accordion
 *
 * Copyright 2017-2018 Michał Strumpf
 * Published under MIT License
 */

(function(window) {

    'use strict';
    
    let options;
    let uniqueId = 0;

    /**
     * Core
     * @param {string} selector = container, where script will be defined
     * @param {object} userOptions = options defined by user
     */
    let Accordion = function(selector, userOptions)
    {

        // Defaults 
        let defaults = {
            duration: 600,
            itemNumber: 0,
            aria: true,
            closeOthers: true,
            showItem: false,
            elementClass: 'ac',
            questionClass: 'ac-q',
            answerClass: 'ac-a',
            targetClass: 'ac-target'
        };

        options = extendDefaults(defaults, userOptions);
        let resize;

        // Get container elements
        let container = document.querySelector(selector);
        let elements = container.querySelectorAll('.' + options.elementClass);

        if (options.aria === true) {
            container.setAttribute('role', 'tablist');
        }

        // For each element
        for (let i = 0; i < elements.length; i++)
        {
            hideElement(elements[i]);
            setTransition(elements[i]);
            generateID(elements[i]);

            // set ARIA
            if (options.aria === true) {
                setARIA(elements[i]);
            }

            // On press Enter
            elements[i].addEventListener('keydown', (event) => {
                if (event.keyCode == 13) {
                    callEvent(elements, i, event);
                }
            });  

            // On click
            elements[i].addEventListener('click', (event) => {
                callEvent(elements, i, event);
            });
        }   

        // Show element when script is loaded
        if (options.showItem === true) {

            // Default value
            let el = elements[0];

            if (typeof options.itemNumber === 'number' && options.itemNumber < elements.length) {
                el = elements[options.itemNumber];
            }

            toggleElement(el, false);
        }
   
        // Window resize
        window.addEventListener('resize', () => {
            cancelAnimationFrame(resize);
            resize = requestAnimationFrame(() => {
                changeHeight(container);
            });
        });
    }

    /**
     * Call event
     * @param {object} elements = list of elements
     * @param {number} index = item index
     * @param {object} event = event type
     */    
     function callEvent(elements, index, event)
    {
        let target = event.target || event.srcElement;

        // Check if target has one of the classes
        if (target.className.match(options.questionClass) || target.className.match(options.targetClass)) {

            event.preventDefault ? event.preventDefault() : (event.returnValue = false);

            if (options.closeOthers === true) {
                closeAllElements(elements, index);
            }

            toggleElement(elements[index]);
        }
    }

    /**
     * Create ARIA
     * @param {object} element = list item
     */
    function setARIA(element)
    {
        let question;
        let answer;

        question = element.querySelector('.' + options.questionClass);
        question.setAttribute('role', 'tab');
        question.setAttribute('aria-expanded', 'false');

        answer = element.querySelector('.' + options.answerClass);
        answer.setAttribute('role', 'tabpanel');
    }

    /**
     * Update ARIA
     * @param {object} element = list item
     * @param {boolean} value = value of the attribute
     */
    function updateARIA(element, value)
    {
        let question = element.querySelector('.' + options.questionClass);
        question.setAttribute('aria-expanded', value); 
    }

    /**
     * Generate unique ID for each element
     * @param {object} element = list item
     */
    function generateID(element)
    {   
        element.setAttribute('id', `ac-${uniqueId}`);
        uniqueId++;
    }

    /**
     * Change element height, when window is resized and when element is active
     * @param {object} container = accordion container
     */
    function changeHeight(container)
    {
        let height;
        let answer;
        let elements = container.querySelectorAll('.' + options.elementClass);

        for (let i = 0; i < elements.length; i++)
        {
            if (elements[i].className.match('active')) {

                answer = elements[i].querySelector('.' + options.answerClass);

                // Set to auto and get new height
                requestAnimationFrame(() => {
                    answer.style.height = 'auto';
                    height = answer.offsetHeight;

                    requestAnimationFrame(() => {
                        answer.style.height = height + 'px';
                    });
                });
            }
        }
    }

    /**
     * Hide element
     * @param {object} element = list item
     */
    function hideElement(element)
    {
        let question = element.querySelector('.' + options.questionClass);
        let answer = element.querySelector('.' + options.answerClass);

        requestAnimationFrame(() => {
            answer.style.height = 0;
        });
    }

    /**
     * Set transition 
     * @param {object} element = current element
     */
    function setTransition(element)
    {
        let el = element.querySelector('.' + options.answerClass);
        let transition = getSupportedProperty('Transition');

        el.style[transition] = options.duration + 'ms';
    }

    /** 
     * Toggle current element
     * @param {object} element = current element
     * @param {boolean} animation = turn on animation
     */
    function toggleElement(element, animation = true)
    {
        let answer = element.querySelector('.' + options.answerClass);
        let height = answer.scrollHeight;
        let ariaValue;

        // Toggle class
        if (element.classList) {
            element.classList.toggle('active');
        } else {
            // For IE
            let classes = element.className.split(' ');
            let j = classes.indexOf('active');

            if (j >= 0) {
                classes.splice(j, 1);
            } else {
                classes.push('active');
            }

            element.className = classes.join(' ');
        }

        // Open element without animation
        if (animation === false) {
            answer.style.height = 'auto';
        }

        // Set height
        if (parseInt(answer.style.height) > 0) {
            ariaValue = false;
            requestAnimationFrame(() => {
                answer.style.height = 0;
            });
        } else {
            ariaValue = true;
            requestAnimationFrame(() => {
                answer.style.height = height + 'px';
            });
        }

        // Update ARIA
        if (options.aria === true) {
            updateARIA(element, ariaValue);
        }
    }

    /**
     * Close all elements without the current element
     * @param {object} elements = list of elements
     * @param {number} current = current element
     */
    function closeAllElements(elements, current)
    {
        for (let i = 0; i < elements.length; i++)
        {
            if(i != current) {

                // Update ARIA
                if (options.aria === true) {
                    updateARIA(elements[i], false);
                }

                let newClassName = '';
                let classes = elements[i].className.split(' ');

                for(let i = 0; i < classes.length; i++)
                {
                    if(classes[i] !== 'active') {
                        newClassName += classes[i];
                    }
                }

                elements[i].className = newClassName;

                hideElement(elements[i]);
            }
        }
    }

    /**
     * Get supported property and add prefix if needed
     * @param {string} property = property name
     * @return {string} propertyWithPrefix = property prefix
     */
    function getSupportedProperty(property)
    {
        let prefix = ['-', 'webkit', 'moz', 'ms', 'o'];
        let propertyWithPrefix;

        for (let i = 0; i < prefix.length; i++) 
        {
            if (prefix[i] == '-') {
                propertyWithPrefix = property.toLowerCase();
            } else {
                propertyWithPrefix = prefix[i] + property;
            }

            if (typeof document.body.style[propertyWithPrefix] != 'undefined') {
               return propertyWithPrefix;
            }
        }

        return null;
    }

    /** 
     * Extend defaults
     * @param {object} defaults = defaults options defined in script
     * @param {object} properties = options defined by user
     * @return {object} defaults = modified options
     */
    function extendDefaults(defaults, properties)
    {
        if (properties != null && properties != undefined && properties != 'undefined') {
            for (let property in properties) {
                defaults[property] = properties[property];
            }
        }

        return defaults;
    }

    /**
     * RequestAnimationFrame support
     */
    window.requestAnimationFrame = (() => {
        return window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               function(callback) {
                   window.setTimeout(callback, 1000 / 60);
               };
    })();

    /**
     * CancelAnimationFrame support
     */
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = (id) => {
            clearTimeout(id);
        };
    }

    window.Accordion = Accordion;

})(window);