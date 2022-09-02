import { DashboardContent } from '../../components/dashboard';
import { ViewFiles } from '../../components/fileViewHandler';

export default function ViewCollection() {
    return(
        <ViewFiles title="Open collection"/>
    )
}

ViewCollection.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
  }