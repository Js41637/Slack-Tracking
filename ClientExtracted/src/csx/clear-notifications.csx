using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using SlackNotifier;

public class Startup
{
  public Task<object> Invoke(ExpandoObject args)
  {
    try {
      var theArgs = (IDictionary<string, object>)args;
      if ((bool)theArgs["isWin10"]) {
        var notifier = new Win10Notifier();
        notifier.ClearNotificationsForTeam((string)theArgs["teamId"]);
      }
      return Task.FromResult(default(object));
    } catch (Exception ex) {
      return Task.FromResult((object)ex.ToString());
    }
  }
}
