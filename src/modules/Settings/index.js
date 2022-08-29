import React, { useEffect, useState } from "react";
import { Form, Input, Card, Button, message } from "antd";
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-google-places-autocomplete";
import { DataStore } from "aws-amplify";
import { Restaurant } from "../../models";
import { useRestaurantContext } from "../../contexts/RestaurantContext";

const Settings = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  const { sub, restaurant, setRestaurant } = useRestaurantContext();

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setCoordinates({ lat: restaurant.lat, lng: restaurant.lng });
    }
  }, [restaurant]);

  const getAddressLatLng = async (address) => {
    setAddress(address);
    const geocodedByAddress = await geocodeByAddress(address.label);
    const latLng = await getLatLng(geocodedByAddress[0]);
    setCoordinates(latLng);
  };

  const onSubmit = async () => {
    if (!restaurant) {
      await createNewRestaurant();
    } else {
      await updateRestaurant();
    }
  };

  const createNewRestaurant = async () => {
    const newRestaurant = await DataStore.save(
      new Restaurant({
        name,
        image:
          "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        deliveryFee: 50,
        minDeliveryTime: 15,
        maxDeliveryTime: 60,
        address: address.label,
        rating: 0,
        lat: coordinates.lat,
        lng: coordinates.lng,
        adminSub: sub,
      })
    );
    setRestaurant(newRestaurant);
    message.success("Restaurant has been created!");
  };

  const updateRestaurant = async () => {
    const updatedRestaurant = await DataStore.save(
      Restaurant.copyOf(restaurant, (updated) => {
        updated.name = name;
        if (address) {
          updated.address = address.label;
          updated.lat = coordinates.lat;
          updated.lng = coordinates.lng;
        }
      })
    );
    setRestaurant(updatedRestaurant);
    message.success("Restaurant updated!");
  };

  return (
    <Card title="Restaurant Details" style={{ margin: 20 }}>
      <Form layout="vertical" wrapperCol={{ span: 8 }} onFinish={onSubmit}>
        <Form.Item label="Restaurant Name" required>
          <Input
            placeholder="Enter restaurant name here"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Restaurant Address" required>
          <GooglePlacesAutocomplete
            apiKey="AIzaSyCo88DfUDZWtQQEDaysJVz9lsPDHz-Vz2A"
            selectProps={{
              value: address,
              onChange: getAddressLatLng,
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      {/* <span>
        {coordinates?.lat} - {coordinates?.lng}
      </span> */}
    </Card>
  );
};

export default Settings;
