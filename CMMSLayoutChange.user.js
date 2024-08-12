// ==UserScript==
// @name        CMMS quality of life
// @namespace   Violentmonkey Scripts
// @match       https://cmms.extra.bnref.hu/*
// @grant       none
// @version     3.0
// @description 2024. 05. 10. 7:57:20
// @require     https://code.jquery.com/jquery-3.6.4.min.js#sha256-oP6HI9z1XaZNBrJURtCoUT5SUnxFr8s3BzRl+cbzUq8=
// ==/UserScript==

(function() {
    'use strict';

    jQuery(document).ready(function() {
        // Regular expression to match URLs with or without "default.aspx" and with or without "#ShortcutViewID", case-insensitive
        var urlRegex = /^https:\/\/cmms\.extra\.bnref\.hu\/(?:default\.aspx)?(?:#ShortcutViewID.*)?$/i;

        if (urlRegex.test(window.location.href)) {
            // Track the last known URL
            let lastUrl = window.location.href;

            // Function to move the size bar to the left
            let moveSizeLeft = function() {
                let rightSize = document.querySelector(".dxp-pageSizeItem");
                if (rightSize && rightSize.classList.contains("dxp-right")) {
                    rightSize.classList.remove("dxp-right");
                }
            };
            setInterval(moveSizeLeft, 2000);

            // Function to find and log the value within the nested children of the sibling of the <td> with content "Igénylési szám:"
            let findIgénylésiSzámValue = function() {
                let tds = document.querySelectorAll('td');
                for (let td of tds) {
                    if (td.textContent.trim() === "Igénylési szám:") {
                        try {
                            let value = td.parentElement.children[1].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].value;
                            return value; // Return the value if found
                        } catch (error) {
                            console.error('Error accessing nested value:', error);
                        }
                    }
                }
                return null; // Return null if not found
            };

            let findMellekletekParents = function() {
                let igénylésiSzámValue = findIgénylésiSzámValue();
                if (!igénylésiSzámValue) {
                    console.error('Igénylési szám value not found.');
                    return;
                }

                let spans = document.querySelectorAll('span');
                spans.forEach((span) => {
                    if (span.textContent.trim() === "Mellékletek") {
                        let parentParent = span.closest('.dxtc-activeTab');
                        if (parentParent) {
                            if (parentParent.style.display != "none"){
                                console.log("Mellékletek aktív");

                                let pictureRows = document.querySelector(".dxtc-content > div:nth-child(4) > div > div > div > div > div:nth-child(2) > div > table > tbody > tr > td > table > tbody").children;
                                for (let i=1; i<pictureRows.length; i++){
                                    let picture = pictureRows[i].children[2].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].src;
                                    console.log(picture);
                                    downloadImageAsJpg(picture, `${igénylésiSzámValue}_${i}`);
                                }
                            }else{
                                console.log("Mellékletek passzív");
                            }
                        }
                    }
                });
            };

            // Function to download an image as JPG with a specific name
            function downloadImageAsJpg(url, name) {
                fetch(url)
                    .then(response => response.blob())
                    .then(blob => {
                        let a = document.createElement('a');
                        let objectURL = window.URL.createObjectURL(blob);
                        a.href = objectURL;
                        a.download = `${name}.jpg`;
                        a.click();
                        window.URL.revokeObjectURL(objectURL);
                    })
                    .catch(error => console.error('Error downloading image:', error));
            }

            // Function to check if "Mellékletek" is active
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

            // Create a floating button
            let floatingButton = document.createElement('button');
            floatingButton.textContent = "Összes fotó letöltése";
            floatingButton.style.position = 'fixed';
            floatingButton.style.bottom = '10px';
            floatingButton.style.left = '10px';
            floatingButton.style.zIndex = '9999';
            floatingButton.style.backgroundColor = '#007BFF';
            floatingButton.style.color = 'white';
            floatingButton.style.border = 'none';
            floatingButton.style.padding = '10px 20px';
            floatingButton.style.borderRadius = '5px';
            floatingButton.style.cursor = 'pointer';
            floatingButton.style.display = 'none'; // Initially hidden

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
            floatingButton.addEventListener('click', findMellekletekParents);

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
            function fixWideElement(selector) {
                const wideElement = document.querySelector(selector);

                if (wideElement) {
                    // Create a wrapper div for the wide element
                    const wrapper = document.createElement('div');
                    wrapper.style.overflowX = 'hidden';  // Hide the scrollbar in this wrapper
                    wrapper.style.width = '100%';
                    wrapper.style.position = 'relative';
                    wrapper.style.boxSizing = 'border-box';

                    // Move the wide element into the wrapper
                    wideElement.parentNode.insertBefore(wrapper, wideElement);
                    wrapper.appendChild(wideElement);

                    // Create a floating scrollbar container
                    const scrollbarContainer = document.createElement('div');
                    scrollbarContainer.style.position = 'fixed';
                    scrollbarContainer.style.bottom = '0';  // Positioned at the bottom of the screen
                    scrollbarContainer.style.left = '0';
                    scrollbarContainer.style.width = '100%';
                    scrollbarContainer.style.overflowX = 'scroll';
                    scrollbarContainer.style.height = '20px';  // Height of the scrollbar
                    scrollbarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';  // Optional: make it slightly transparent
                    scrollbarContainer.style.zIndex = '9999';  // Ensure it appears on top of other elements

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

                    // Optional: If the body has overflow issues, you can also fix that
                    document.body.style.overflowX = 'hidden';

                    console.log(`Element with selector "${selector}" has been fixed with a floating scrollbar.`);
                } else {
                    console.warn(`Element with selector "${selector}" not found.`);
                }
            }

            // Function to check if URL has changed
            function checkUrlChange() {
                if (window.location.href !== lastUrl) {
                    lastUrl = window.location.href;
                    fixWideElement("#Vertical_ContentColorPanel");
                }
            }

            // Set an interval to check for URL changes
            setInterval(checkUrlChange, 1000); // Check every 1 second

            // Initial call to fixWideElement on page load
            fixWideElement("#Vertical_ContentColorPanel");
        }
    });
})();
