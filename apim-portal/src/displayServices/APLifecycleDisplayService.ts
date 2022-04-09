
export enum EAPLifecycleState {
  DRAFT = "draft",
  RELEASED = "released",
  DEPRECATED = "deprecated",
}

class APLifecycleDisplayService {
  private readonly ComponentName = "APLifecycleDisplayService";

  public get_Default_LifecycleState = (): EAPLifecycleState => {
    return EAPLifecycleState.DRAFT;
  }

  public get_SelectList = (): Array<EAPLifecycleState> => {
    return Object.values(EAPLifecycleState);
  }

  public isValid = (state: string): boolean => {
    return Object.values(EAPLifecycleState).includes(state as EAPLifecycleState);
  }

}

export default new APLifecycleDisplayService();
