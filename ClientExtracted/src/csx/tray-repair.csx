using System;
using System.Threading.Tasks;
using SlackNotifier;

public class Startup
{
  public async Task<object> Invoke(object path)
  {
    try {
      var tsc = new TrayStateChanger();
      await tsc.FixupSlackTrayItems((string)path);
      return default(object);
    } catch (Exception ex) {
      Console.WriteLine(ex.ToString());
      return ex.ToString();
    }
  }
}
