using System;
using System.Threading.Tasks;
using SlackNotifier;

public class Startup
{
  public async Task<object> Invoke(object folderName)
  {
    try {
      return new { path = KnownFolders.GetPath((string)folderName) };
    } catch (Exception ex) {
      Console.WriteLine(ex.ToString());
      return ex.ToString();
    }
  }
}
