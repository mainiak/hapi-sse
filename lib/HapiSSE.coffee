class HapiSSE

  constructor: ->
    @_users = {}

  isOnline: (user) ->
    return @_users[user]?

  sendMsgTo: (user, msg) ->
    if not @isOnline user
      throw new Error 'user is offline'
    data = 'data: ' + msg + "\n\n"
    @_users[user].write data
    #console.log data # XXX

  _addUser: (user, stream) ->
    @_users[user] = stream
    #console.log 'adding ' + user # XXX

  _delUser: (user) ->
    @_users[user].end()
    delete @_users[user]
    #console.log 'removing ' + user # XXX

module.exports = HapiSSE
