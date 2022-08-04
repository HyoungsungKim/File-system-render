import { DashboardContent } from '../../components/dashboard';
import { ViewFiles } from '../../components/fileViewHandler';

export default function ViewCollection() {
    return(
        <DashboardContent >
            <ViewFiles title="Open collection"/>
        </DashboardContent>
    )
}

ViewCollection.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
  }