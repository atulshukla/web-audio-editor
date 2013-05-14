/**
 * This helper object provides functions related to drawing waveforms,
 * zoom level, etc.
 *
 * @file        Helpers.Display.js
 * @author      Jan Myler <honza.myler[at]gmail.com>
 * @copyright   Copyright 2012, Jan Myler (http://janmyler.com)
 * @license     MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'plugins/modal'
], function($, _, Backbone, AlertT) {
    return (function() {
        function Uploader() {
        }

        Uploader.prototype.createCORSRequest = function(method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest != "undefined") {
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                xhr = null;
            }
            return xhr;
        }
         
        Uploader.prototype.handleFileSelect = function(evt){
            //setProgress(0, 'Upload started.');
            //
            console.log("file upload event passed to Uploader");
            var files = evt.target.files; 
         
            var output = [];
            for (var i = 0, f; f = files[i]; i++) {
                this.uploadFile(f);
            }
        }
         
        /**
         * Execute the given callback with the signed response.
         */
        Uploader.prototype.executeOnSignedUrl = function(file, callback)
        {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', '/assets/signput?name=' + file.name + '&type=' + file.type, true);
         
          // Hack to pass bytes through unprocessed.
          xhr.overrideMimeType('text/plain; charset=x-user-defined');
         
          xhr.onreadystatechange = function(e) 
          {
            if (this.readyState == 4 && this.status == 200) 
            {
                console.log("hash obtained");
              callback(decodeURIComponent(this.responseText));
            }
            else if(this.readyState == 4 && this.status != 200)
            {
                console.log("getting signed");
              //setProgress(0, 'Could not contact signing script. Status = ' + this.status);
            }
          };
         
          xhr.send();
        }
         
        Uploader.prototype.uploadFile = function(file){
            console.log("begin to upload S3");
            var self = this;
            this.executeOnSignedUrl(file, function(signedURL){
                self.uploadToS3(file, signedURL);
            });
        }
         
        /**
         * Use a CORS call to upload the given file to S3. Assumes the url
         * parameter has been signed and is accessable for upload.
         */
        Uploader.prototype.uploadToS3 = function(file, url)
        {
          var xhr = this.createCORSRequest('PUT', url);
          if (!xhr) 
          {
            //setProgress(0, 'CORS not supported');
            console.log("!xrh");
          }
          else
          {
            console.log("corse request created");
            xhr.onload = function() {
                if(xhr.status == 200){
                    //setProgress(100, 'Upload completed.');
                } else {
                    //setProgress(0, 'Upload error: ' + xhr.status);
                }
            };
         
            xhr.onerror = function() 
            {
              setProgress(0, 'XHR error.');
            };
         
            xhr.upload.onprogress = function(e) 
            {
              if (e.lengthComputable) 
              {
                var percentLoaded = Math.round((e.loaded / e.total) * 100);
                //setProgress(percentLoaded, percentLoaded == 100 ? 'Finalizing.' : 'Uploading.');
              }
            };
         
            console.log("on cors");
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
         
            xhr.send(file);
          }
        }
         
        // function setProgress(percent, statusLabel)
        // {
        //   var progress = document.querySelector('.percent');
        //   progress.style.width = percent + '%';
        //   progress.textContent = percent + '%';
        //   document.getElementById('progress_bar').className = 'loading';
         
        //   document.getElementById('status').innerText = statusLabel;
        // }

        return Uploader;
    })();
});