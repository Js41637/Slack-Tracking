using System;
using System.Threading.Tasks;
using SlackNotifier;

public class Startup
{
  public async Task<object> Invoke(object fullIconPath)
  {
    try {
      var iconPath = (string)fullIconPath;
      NativeMethods.SetIconForOurWindows(iconPath);

      return default(object);
    } catch (Exception ex) {
      return ex.ToString();
    }
  }
}
