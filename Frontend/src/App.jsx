import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [datas, setDatas] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search input
  const [showModal, setShowModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ name: '', age: '', city: '' });
  const [showValidation, setShowValidation] = useState(false);
  const [index, setIndex] = useState(null);

  const handleFilter = (value) => {
    setSearchTerm(value);
    const newData = datas.filter((dataFrom) =>
      dataFrom.name.toUpperCase().includes(value.toUpperCase()) ||
      dataFrom.city.toUpperCase().includes(value.toUpperCase())
    );
    setFilterData(newData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/getUsers');
      setDatas(response.data);
      setFilterData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const addNewRecord = async () => {
    if (newRecord.name.trim() === '' || newRecord.age.trim() === '' || newRecord.city.trim() === '') {
      setShowValidation(true);
    } else {
      try {
        const response = await axios.post('http://localhost:3000/addUser', newRecord);
        setDatas([...datas, response.data]);
        setFilterData([...filterData, response.data]);
        setNewRecord({ name: '', age: '', city: '' });
        setShowModal(false);
        setShowValidation(false);
      } catch (error) {
        console.error('Error adding new record:', error);
      }
    }
  };

  const editData = (index) => {
    const recordToEdit = datas[index];
    setNewRecord({ ...recordToEdit });
    setIndex(index);
    setShowModal(true);
  };

  const updateRecord = async () => {
    try {
      await axios.put(`http://localhost:3000/updateUser/${newRecord._id}`, newRecord);
      const updatedData = datas.map((data, idx) => (idx === index ? newRecord : data));
      setDatas(updatedData);
      setFilterData(updatedData);
      setShowModal(false);
      setNewRecord({ name: '', age: '', city: '' });
      setIndex(null);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const removeData = async (index) => {
    if (window.confirm('Are you sure you want to delete the data?')) {
      try {
        await axios.delete(`http://localhost:3000/deleteUser/${datas[index]._id}`);
        const newData = datas.filter((_, i) => i !== index);
        setDatas(newData);
        setFilterData(newData);
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <header>CRUD Application with REACT JS</header>
      </div>
      <div className="input">
        <input
          value={searchTerm} // Controlled input with searchTerm state
          onChange={(e) => handleFilter(e.target.value)}
          placeholder="Enter to search..."
          type="text"
        />
        <div className="btn">
          <button onClick={() => setShowModal(true)}>Add record</button>
        </div>
      </div>
      <div className="data">
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Name</th>
              <th>Age</th>
              <th>City</th>
              <th className="edit">Edit</th>
              <th className="remove">Remove</th>
            </tr>
          </thead>
          <tbody>
            {filterData.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.age}</td>
                <td>{item.city}</td>
                <td className="edit">
                  <button style={{ borderRadius: "5px" }} onClick={() => editData(index)}>Edit</button>
                </td>
                <td className="remove">
                  <button style={{ borderRadius: "5px" }} onClick={() => removeData(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{index !== null ? 'Edit Record' : 'Add New Record'}</h2>
              <button
                className="close-button"
                onClick={() => {
                  setShowModal(false);
                  setNewRecord({ name: '', age: '', city: '' });
                  setIndex(null);
                }}
              >
                Close
              </button>
            </div>
            <div className="modal-content">
              {showValidation && <div className="validation-screen">Please enter all fields!</div>}
              <input
                name="name"
                value={newRecord.name}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter your name"
                autoComplete="off"
              />
              <input
                name="age"
                value={newRecord.age}
                onChange={handleInputChange}
                type="number"
                autoComplete="off"
                placeholder="Enter your age"
              />
              <input
                name="city"
                value={newRecord.city}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter your city"
                autoComplete="off"
              />
              <button onClick={index !== null ? updateRecord : addNewRecord}>
                {index !== null ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
