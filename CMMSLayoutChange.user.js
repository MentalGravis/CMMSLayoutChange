// ==UserScript==
// @name        Sizebar left & adjusted description heights
// @namespace   Violentmonkey Scripts
// @match       https://cmms.extra.bnref.hu/*
// @grant       none
// @version     1.0
// @author      MentalG
// @description 2024. 05. 10. 7:57:20
// @require     https://code.jquery.com/jquery-3.6.4.min.js#sha256-oP6HI9z1XaZNBrJURtCoUT5SUnxFr8s3BzRl+cbzUq8=
// ==/UserScript==

(function() {
    'use strict';
    // console.log("outerrun");
    jQuery(document).ready(function(){
        // Regular expression to match URLs with or without "default.aspx" and with or without "#ShortcutViewID", case-insensitive
        var urlRegex = /^https:\/\/cmms\.extra\.bnref\.hu\/(?:default\.aspx)?(?:#ShortcutViewID.*)?$/i;

        if (urlRegex.test(window.location.href)) {
            // console.log("1st If running");
            let moveSizeLeft = function() {
                // console.log("running");
                let rightSize = document.querySelector(".dxp-pageSizeItem");
                if (rightSize.classList[1]){
                    // console.log("bakfitty");
                    rightSize.classList.remove("dxp-right");
                }
            }
            setInterval(moveSizeLeft, 2000);

            if (/WorkOrder_DetailView/.test(window.location.href)) {
                // console.log("2nd If running");
                let dinamicTextWindows = function() {

                    let allTextSpaces = document.querySelectorAll(".dxeMemoEditArea_BelizeSE");

                    allTextSpaces.forEach((element) => {

                        // console.log(element.textContent);

                        if (element.textContent){
                            let numberofrows = numRows(element);
                            if (numberofrows > 3 && element.rows != numberofrows){
                                element.rows = numberofrows;
                            }
                        }
                    });
                }

                function numRows (domElement){
                    let numberofrows = 0;
                    if (domElement.textContent && domElement.textContent.split("\n")){
                        domElement.textContent.split("\n").forEach((element) => {
                            if(element.length != 0){
                                numberofrows += Math.ceil(element.length/130);
                            }
                            if(element.length == 0){
                                numberofrows += 1;
                            }
                        });
                    }else if (domElement.textContent){
                        numberofrows += Math.ceil(domElement.textContent.length/130);
                    }
                    // console.log(numberofrows);
                    return numberofrows;
                }

                setInterval(dinamicTextWindows, 2000);
            }
        }
    });
})();
