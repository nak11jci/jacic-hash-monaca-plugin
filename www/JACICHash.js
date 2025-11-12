/**
 * JACIC Hash Plugin JavaScript Interface
 *
 * This plugin provides a function to embed hash values
 * in JPEG files' APP5 region for tampering detection.
 */

var exec = require('cordova/exec');

var JACICHash = {
    /**
     * Write hash value to JPEG file
     *
     * @param {string} sourceFilePath - Source JPEG file path
     * @param {string} destFilePath - Destination JPEG file path
     * @param {function} successCallback - Success callback with result object
     * @param {function} errorCallback - Error callback with error object
     *
     * Success result object:
     * {
     *   code: 0,
     *   message: "Hash value written successfully",
     *   outputPath: "/path/to/output.jpg"
     * }
     *
     * Error codes:
     * -101: Incorrect parameter
     * -102: Same file path for source and destination
     * -201: Source file does not exist
     * -202: Destination file already exists
     * -203: Failed to open file
     * -204: File size is zero
     * -205: Failed to write file
     * -206: Failed to close file
     * -301: Incorrect EXIF format
     * -302: APP5 segment already exists
     * -307: Date information not found
     * -900: Other error
     */
    writeHash: function(sourceFilePath, destFilePath, successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'JACICHash', 'writeHash', [sourceFilePath, destFilePath]);
    }
};

module.exports = JACICHash;
