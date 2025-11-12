//
//  CDVJACICHash.h
//  JACIC Hash Cordova Plugin
//
//  Cordova plugin wrapper for JACIC Hash Library
//

#import <Cordova/CDV.h>

@interface CDVJACICHash : CDVPlugin

- (void)writeHash:(CDVInvokedUrlCommand*)command;

@end
