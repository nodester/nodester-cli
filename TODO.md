# TODO

### Minor

  * Nothing here yet

### Major

  * Remove all SSH key logic and replace with GitHub integration (maybe)
  * WebForm for requesting coupons
  * WebForm for requesting password resets
  * WebForm for resetting password
  * WebForm for resetting SSH key for git
  
  * The following commands:
  nodester status - Displays service status
  nodester login <username> <password> - Creates local user file if credentials are valid
  nodester logout - Deletes local user file
  nodester apps - Lists all user apps
  
  nodester create <appname> <(optional initial js file)> - Creates app on server and sets the initial js file. Creates app folder locally
  nodester <appname> info - Displays app info.
  nodester <appname> logs - Displays app logs
  nodester <appname> start - Starts the app
  nodester <appname> restart - Restarts the app
  nodester <appname> stop - Stops the app
  nodester <appname> delete - Deletes the app
  nodester <appname> push - Pushes files to the app
  nodester <appname> link <giturl> - Future pushes will pull data from <giturl>
  nodester <appname> install <package names> - Installs packages for npm
  nodester <appname> upgrade - Upgrades packages for npm
  nodester <appname> uninstall <package names> - Uninstalls packages for npm. Package name "all" will clean npm registry
  nodester <appname> alias <domain-name> - Set up external domain route for app
  nodester <appname> unalias <domain-name> - Remove external domain route for app
  nodester <appname> aliases - List all routes
  
