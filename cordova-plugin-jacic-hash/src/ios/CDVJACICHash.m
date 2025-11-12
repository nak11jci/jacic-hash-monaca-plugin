//
//  CDVJACICHash.m
//  JACIC Hash Cordova Plugin
//
//  Cordova plugin wrapper for JACIC Hash Library
//

#import "CDVJACICHash.h"
#import "writeHashLib.h"

@implementation CDVJACICHash

/**
 * Write hash value to JPEG file
 * @param command CDVInvokedUrlCommand with arguments:
 *        - sourceFilePath: Source JPEG file path
 *        - destFilePath: Destination JPEG file path
 */
- (void)writeHash:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;

        // Get arguments
        NSString* sourceFilePath = [command.arguments objectAtIndex:0];
        NSString* destFilePath = [command.arguments objectAtIndex:1];

        // Validate arguments
        if (sourceFilePath == nil || destFilePath == nil ||
            [sourceFilePath length] == 0 || [destFilePath length] == 0) {
            NSDictionary* errorDict = @{
                @"code": @(-101),
                @"message": @"Invalid parameters: sourceFilePath and destFilePath are required"
            };
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsDictionary:errorDict];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        // Call native library
        int result = JACIC_WriteHashValue([sourceFilePath UTF8String], [destFilePath UTF8String]);

        // Return result
        if (result == 0) {
            NSDictionary* successDict = @{
                @"code": @(result),
                @"message": @"Hash value written successfully",
                @"outputPath": destFilePath
            };
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                         messageAsDictionary:successDict];
        } else {
            NSDictionary* errorDict = @{
                @"code": @(result),
                @"message": [self getErrorMessage:result],
                @"sourcePath": sourceFilePath,
                @"destPath": destFilePath
            };
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                         messageAsDictionary:errorDict];
        }

        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

/**
 * Get error message for writeHash error codes
 */
- (NSString*)getErrorMessage:(int)errorCode {
    switch (errorCode) {
        case -101: return @"Incorrect parameter";
        case -102: return @"Same file path for source and destination";
        case -201: return @"Source file does not exist";
        case -202: return @"Destination file already exists";
        case -203: return @"Failed to open file";
        case -204: return @"File size is zero";
        case -205: return @"Failed to write file";
        case -206: return @"Failed to close file";
        case -301: return @"Incorrect EXIF format";
        case -302: return @"APP5 segment already exists";
        case -307: return @"Date information not found";
        case -900: return @"Other error";
        default: return [NSString stringWithFormat:@"Unknown error (code: %d)", errorCode];
    }
}

@end
