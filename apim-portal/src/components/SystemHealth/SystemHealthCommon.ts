import { EAPHealthCheckSuccess, TAPHealthCheckSummary } from "../../utils/APHealthCheck";
import { Globals } from "../../utils/Globals";


export class SystemHealthCommon {
  private static componentName = 'SystemHealthCommon';

  public static getColor = (success: EAPHealthCheckSuccess): string => {
    const funcName = 'getColor';
    const logName = `${SystemHealthCommon.componentName}.${funcName}()`;
    switch(success) {
      case EAPHealthCheckSuccess.PASS:
        return 'green';
      case EAPHealthCheckSuccess.PASS_WITH_ISSUES:
        return 'orange';
      case EAPHealthCheckSuccess.FAIL:
        return 'red';
      case EAPHealthCheckSuccess.UNDEFINED:
        throw new Error(`${logName}: success = ${success}`);
      default:
        Globals.assertNever(logName, success);
    }
    return 'red';
  }

  public static getButtonClassName = (systemHealthCheckSummary: TAPHealthCheckSummary): string => {
    const funcName = 'getButtonClassName';
    const logName = `${SystemHealthCommon.componentName}.${funcName}()`;
    if(!systemHealthCheckSummary.performed) return 'p-button-rounded p-button-secondary p-button-outlined';
    switch(systemHealthCheckSummary.success) {
      case EAPHealthCheckSuccess.PASS:
        return 'p-button-rounded p-button-success';
      case EAPHealthCheckSuccess.PASS_WITH_ISSUES:
        return 'p-button-rounded p-button-warning';
      case EAPHealthCheckSuccess.FAIL:
        return 'p-button-rounded p-button-danger';
      case EAPHealthCheckSuccess.UNDEFINED:
        return 'p-button-rounded p-button-secondary p-button-outlined';
      default:
        Globals.assertNever(logName, systemHealthCheckSummary.success);
    }
    return 'red';
  }

  public static getSystemHealthIcon = (systemHealthCheckSummary: TAPHealthCheckSummary): string => {
    const funcName = 'getSystemHealthIcon';
    const logName = `${SystemHealthCommon.componentName}.${funcName}()`;
    if(!systemHealthCheckSummary.performed) return 'pi pi-question';
    switch(systemHealthCheckSummary.success) {
      case EAPHealthCheckSuccess.PASS:
      case EAPHealthCheckSuccess.PASS_WITH_ISSUES:
        return 'pi pi-check';
      case EAPHealthCheckSuccess.FAIL:
        return 'pi pi-times';
      case EAPHealthCheckSuccess.UNDEFINED:
        return 'pi pi-question';
      default:
        Globals.assertNever(logName, systemHealthCheckSummary.success);
    }
    return 'pi pi-question';
  }

}

