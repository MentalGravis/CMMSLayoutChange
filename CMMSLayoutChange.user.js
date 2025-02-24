// ==UserScript==
// @name        CMMS quality of life
// @namespace   Violentmonkey Scripts
// @match       https://cmms.extra.bnref.hu/*
// @grant       none
// @version     2.4
// @description 2024. 05. 10. 7:57:20
// @require     https://code.jquery.com/jquery-3.6.4.min.js#sha256-oP6HI9z1XaZNBrJURtCoUT5SUnxFr8s3BzRl+cbzUq8=
// ==/UserScript==

(function() {
    'use strict';

    jQuery(document).ready(function() {
        // Regular expression to match URLs with or without "default.aspx" and with or without "#ShortcutViewID", case-insensitive
        var urlRegex = /^https:\/\/cmms\.extra\.bnref\.hu\/(?:default\.aspx)?(?:#ShortcutViewID.*)?$/i;

        if (urlRegex.test(window.location.href)) {
            // Track the last known URL and window width
            let lastUrl = window.location.href;
            let lastWidth = window.innerWidth;

            // Function to move the size bar to the left
            let moveSizeLeft = function() {
                let rightSize = document.querySelector(".dxp-pageSizeItem");
                if (rightSize && rightSize.classList.contains("dxp-right")) {
                    rightSize.classList.remove("dxp-right");
                }
            };
            setInterval(moveSizeLeft, 2000);


            // Retrieve the "Igénylési szám" value from an input
            const findIgénylésiSzámValue = () => {
                const input = document.querySelector('input[name*=RequestNumber]');
                return input ? input.value : null;
            };

            let isMellekletekActive = function() {
                let spans = document.querySelectorAll('span');
                for (let span of spans) {
                    if (span.textContent.trim() === "Mellékletek") {
                        let parentParent = span.closest('.dxtc-activeTab');
                        if (parentParent && parentParent.style.display != "none") {
                            return true;
                        }
                    }
                }
                return false;
            };

            // Download an image as JPG with a specific name
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            const downloadImageAsJpg = async (url, name) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                    const blob = await response.blob();
                    const objectURL = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = objectURL;
                    a.download = `${name}.jpg`;
                    document.body.appendChild(a); // Append to the DOM before clicking
                    a.click();
                    document.body.removeChild(a); // Remove after click

                    URL.revokeObjectURL(objectURL);
                    console.log(`Successfully downloaded: ${name}.jpg`);
                } catch (error) {
                    console.error(`Error downloading image (${name}):`, error);
                }
            };

            const downloadImagesIfActive = async () => {
                const igénylésiSzámValue = findIgénylésiSzámValue();
                if (!igénylésiSzámValue) {
                    console.error('Igénylési szám value not found.');
                    return;
                }

                if (!isMellekletekActive()) {
                    console.log("Mellékletek is not active.");
                    return;
                }

                console.log("Mellékletek is active.");

                const pictureRows = document.querySelectorAll('img[id*="Photo_View"]');
                if (pictureRows.length <= 1) {
                    console.warn("No images found or only one image found.");
                    return;
                }

                for (let i = 1; i < pictureRows.length; i++) { // Start from the second image
                    const img = pictureRows[i];
                    if (img.src) {
                        console.log(`Downloading image ${i}: ${img.src}`);
                        await downloadImageAsJpg(img.src, `${igénylésiSzámValue}_${i}`);
                        await delay(300); // Wait 2 seconds before downloading the next image
                    } else {
                        console.warn(`Skipping image ${i} (No source URL).`);
                    }
                }

                console.log("All images processed.");
            };



            // Run the main download function
            // downloadImagesIfActive();

            // Create a floating button
            let floatingButton = Object.assign(document.createElement('button'), {
                textContent: "Összes fotó letöltése",
                style: `
                    position: fixed;
                    bottom: 30px;
                    left: 10px;
                    z-index: 9999;
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    display: none; /* Initially hidden */
                `
            });

            // Add hover and click effects
            floatingButton.addEventListener('mouseover', function() {
                floatingButton.style.backgroundColor = '#0056b3'; // Darker blue on hover
            });
            floatingButton.addEventListener('mouseout', function() {
                floatingButton.style.backgroundColor = '#007BFF'; // Original blue when not hovering
            });
            floatingButton.addEventListener('mousedown', function() {
                floatingButton.style.backgroundColor = '#003f7f'; // Even darker blue on click
            });
            floatingButton.addEventListener('mouseup', function() {
                floatingButton.style.backgroundColor = '#0056b3'; // Darker blue on hover
            });

            // Add click event to the button to trigger findMellekletekParents function
            floatingButton.addEventListener('click', downloadImagesIfActive);

            // Append the button to the body
            document.body.appendChild(floatingButton);

            // Check URL and "Mellékletek" state every 2 seconds to display or hide the button
            setInterval(function() {
                if (/WorkOrder_DetailView/.test(window.location.href) && isMellekletekActive()) {
                    floatingButton.style.display = 'block';
                } else {
                    floatingButton.style.display = 'none';
                }
            }, 2000);

            // Function to adjust the height of text areas dynamically
            let dinamicTextWindows = function() {
                let allTextSpaces = document.querySelectorAll(".dxeMemoEditArea_BelizeSE");

                allTextSpaces.forEach((element) => {
                    if (element.textContent) {
                        let numberofrows = numRows(element);
                        if (numberofrows > 3 && element.rows !== numberofrows) {
                            element.rows = numberofrows;
                        }
                    }
                });
            };

            // Function to calculate the number of rows needed for a given text content
            function numRows(domElement) {
                let numberofrows = 0;
                if (domElement.textContent) {
                    let lines = domElement.textContent.trim().split("\n");
                    lines.forEach((line) => {
                        numberofrows += Math.ceil(line.length / 130) || 1;
                    });
                }
                return numberofrows;
            }

            setInterval(dinamicTextWindows, 2000);

            // Function to handle the floating scrollbar
            function fixWideElement(selector, maintainScrollPosition = false) {
                const wideElement = document.querySelector(selector);

                if (wideElement) {
                    let currentScrollPercentage = 0;

                    if (maintainScrollPosition) {
                        // Calculate the current scroll position as a percentage
                        currentScrollPercentage = wideElement.scrollLeft / (wideElement.scrollWidth - wideElement.clientWidth);
                    }

                    // Create a wrapper div for the wide element
                    const wrapper = document.createElement('div');
                    Object.assign(wrapper.style, {
                        overflowX: 'hidden',  // Hide the scrollbar in this wrapper
                        width: '100%',
                        position: 'relative',
                        boxSizing: 'border-box'
                    });

                    // Move the wide element into the wrapper
                    wideElement.parentNode.insertBefore(wrapper, wideElement);
                    wrapper.appendChild(wideElement);

                    // Create a floating scrollbar container
                    const scrollbarContainer = document.createElement('div');
                    Object.assign(scrollbarContainer.style, {
                        position: 'fixed',
                        bottom: '0',  // Positioned at the bottom of the screen
                        left: '0',
                        width: '100%',
                        overflowX: 'scroll',
                        height: '20px',  // Height of the scrollbar
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Optional: make it slightly transparent
                        zIndex: '9999'  // Ensure it appears on top of other elements
                    });

                    // Create a dummy inner element to represent the wide content in the scrollbar container
                    const scrollbarContent = document.createElement('div');
                    scrollbarContent.style.width = wideElement.scrollWidth + 'px';
                    scrollbarContent.style.height = '1px';  // This element doesn't need to be visible

                    // Append the dummy content to the scrollbar container
                    scrollbarContainer.appendChild(scrollbarContent);

                    // Append the scrollbar container to the body
                    document.body.appendChild(scrollbarContainer);

                    // Sync the scrolling of the wide element and the scrollbar container
                    scrollbarContainer.addEventListener('scroll', function() {
                        wideElement.scrollLeft = scrollbarContainer.scrollLeft;
                    });

                    // If the wide element itself is scrolled (possibly by other means), sync the scrollbar container
                    wideElement.addEventListener('scroll', function() {
                        scrollbarContainer.scrollLeft = wideElement.scrollLeft;
                    });

                    // Ensure the wide element is scrollable
                    wideElement.style.overflowX = 'scroll';

                    // Restore scroll position based on percentage after resizing
                    if (maintainScrollPosition) {
                        wideElement.scrollLeft = currentScrollPercentage * (wideElement.scrollWidth - wideElement.clientWidth);
                        scrollbarContainer.scrollLeft = wideElement.scrollLeft;
                    }

                    // Optional: If the body has overflow issues, you can also fix that
                    document.body.style.overflowX = 'hidden';

                    console.log(`Element with selector "${selector}" has been fixed with a floating scrollbar.`);
                } else {
                    console.warn(`Element with selector "${selector}" not found.`);
                }
            }

            // Function to check if URL or window size has changed
            function checkUrlOrResize() {
                const currentUrl = window.location.href;
                const currentWidth = window.innerWidth;

                if (currentUrl !== lastUrl || currentWidth !== lastWidth) {
                    lastUrl = currentUrl;
                    lastWidth = currentWidth;
                    fixWideElement("#Vertical_ContentColorPanel", true);  // Maintain scroll position on resize
                }
            }

            // Set an interval to check for URL changes or window resizing
            setInterval(checkUrlOrResize, 1000); // Check every 1 second

            // Listen for window resize event
            window.addEventListener('resize', checkUrlOrResize);

            // Initial call to fixWideElement on page load
            fixWideElement("#Vertical_ContentColorPanel");
        }
    });
})();