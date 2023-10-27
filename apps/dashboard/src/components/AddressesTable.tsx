const AddressesTable = ({ addresses }: { addresses: any }) => {
  return (
    <table className="table table-hover">
      <thead>
        <tr>
          <th scope="col">Building Number</th>
          <th scope="col">Condominium Number</th>
          <th scope="col">Floor Number</th>
          <th scope="col">Lat</th>
          <th scope="col">Lng</th>
        </tr>
      </thead>
      <tbody>
        {addresses.map((address: any) => (
          <tr key={address.id}>
            <td>{address.buildingNumber}</td>
            <td>{address.condominiumNumber}</td>
            <td>{address.floorNumber}</td>
            <td>{address.lat}</td>
            <td>{address.lng}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AddressesTable;
