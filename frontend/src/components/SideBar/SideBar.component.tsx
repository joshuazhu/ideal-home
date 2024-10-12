import { SubmitPropertiesFormComponent } from '../SubmitPropertiesForm/submitPropertiesForm.component';
import { SearchPanelComponent } from '../SearchPanel/searchPanel.comp';

export const SideBarComponent = () => {
  return (
    <>
      <SearchPanelComponent />
      <SubmitPropertiesFormComponent />
    </>
  );
};
