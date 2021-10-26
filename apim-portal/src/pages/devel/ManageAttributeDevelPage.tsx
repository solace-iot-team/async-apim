import React from 'react';

import { APIParameter } from '@solace-iot-team/apim-connector-openapi-browser';
import { APManageApiParameterAttribute, TAPManagedApiParameterAttribute } from '../../components/APManageApiParameterAttribute/APManageApiParameterAttribute';

// * TEST DATA *
const testApiParameterRegionId: APIParameter = {
  name: 'region_id',
  type: APIParameter.type.STRING,
  enum: [
    'r_00', 'r_01', 'r_02', 'r_03', 'r_04', 'r_05', 'r_06', 'r_07', 'r_08', 'r_09', 
    'r_10', 'r_11', 'r_12',
  ]
}
const testApiParameterAssetId: APIParameter = {
  name: 'asset_id',
  type: APIParameter.type.STRING,
}
const test_New_ApManagedAttribute_ApiParameter_RegionId: TAPManagedApiParameterAttribute = {
  apiParameter: testApiParameterRegionId
}
const test_New_ApManagedAttribute_ApiParameter_AssetId: TAPManagedApiParameterAttribute = {
  apiParameter: testApiParameterAssetId
}

export const ManageAttributeDevelPage: React.FC = () => {
  const componentName = 'ManageAttributeDevelPage';

  const onSaveApiParameterAttribute = (apManagedAttribute: TAPManagedApiParameterAttribute) => {
    const funcName = 'onSaveApiParameterAttribute';
    const logName = `${componentName}.${funcName}()`;
    alert(`${logName}: apManagedAttribute=${JSON.stringify(apManagedAttribute, null, 2)}`);
  }
  const onDeleteApiParameterAttribute = (apManagedAttribute: TAPManagedApiParameterAttribute) => {
    const funcName = 'onDeleteApiParameterAttribute';
    const logName = `${componentName}.${funcName}()`;
    alert(`${logName}: apManagedAttribute=${JSON.stringify(apManagedAttribute, null, 2)}`);
  }

  return (
    <React.Fragment>
        <h1>Test API Product Attributes</h1>
        <hr />
        <div>
          <h3>New Attribute from API Parameter: {testApiParameterRegionId.name}:</h3>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(testApiParameterRegionId)}
          </pre>
          <APManageApiParameterAttribute
            apManagedApiParameterAttribute={test_New_ApManagedAttribute_ApiParameter_RegionId}
            options={{
              mode: 'apiProductValues'
            }}
            onSave={onSaveApiParameterAttribute}
            onDelete={onDeleteApiParameterAttribute}
            // onCancel={onCancel}
          />
        </div>
        <hr />
        <div>
          <h3>New Attribute from API Parameter: {testApiParameterAssetId.name}:</h3>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(testApiParameterAssetId)}
          </pre>
          <APManageApiParameterAttribute
            apManagedApiParameterAttribute={test_New_ApManagedAttribute_ApiParameter_AssetId}
            options={{
              mode: 'general'
            }}
            onSave={onSaveApiParameterAttribute}
            onDelete={onDeleteApiParameterAttribute}
            // onCancel={onCancel}
          />
        </div>
    </React.Fragment>
  );

}

