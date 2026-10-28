import { ENDPOINT_GROUPS } from "../all-content";
import { EndpointListing } from "../endpoint-listing";

export default function AllEndpointsPage() {
  return <EndpointListing groups={ENDPOINT_GROUPS} />;
}
