using System;
using System.Threading.Tasks;
using SlackNotifier;

public class Startup
{
  public async Task<object> Invoke(object args)
  {
    try {
      var notifier = (INotifier)new Win7Notifier();

      var ret = new Func<object, Task<object>>(async opts => {
        if (opts == null) {
          notifier.Dispose();
          return null;
        }

        return await notifier.ShowNotification((string)opts);
      });

      return ret;
    } catch (Exception ex) {
      return ex.ToString();
    }
  }
}
