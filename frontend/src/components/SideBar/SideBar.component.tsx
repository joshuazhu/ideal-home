import { SubmitPropertiesFormComponent } from '../SubmitPropertiesForm/submitPropertiesForm.component';
import { SearchPanelComponent } from '../SearchPanel/searchPanel.comp';
import { PropertyListComponent } from '../PropertyList/PropertyList.component';

export const SideBarComponent = () => {
  return (
    <>
      <SearchPanelComponent />
      <SubmitPropertiesFormComponent />
      <PropertyListComponent />
    </>
  );
};
