
class APDisplayUtils {
  private readonly BaseComponentName = "APDisplayUtils";

  // placeholder for common render functions
  // probably from APRenderUtils.tsx

  public nameOf<T>(name: keyof T) {
    return name;
  }  

}

export default new APDisplayUtils();
