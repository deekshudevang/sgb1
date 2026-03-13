import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import { User } from '../models/User';
import { Order } from '../models/Order';

dotenv.config();

const fakeOrders = [
  { customer_name: 'Arjun Mehta', phone_number: '+91 98200 11234', delivery_address: '14, Linking Road, Bandra West, Mumbai - 400050', product_details: '1x Sony WH-1000XM5 Headphones (Black)\n1x USB-C Charging Cable', status: 'ORDER_CREATED' },
  { customer_name: 'Priya Sharma', phone_number: '+91 91234 56789', delivery_address: '22, MG Road, Koramangala, Bengaluru - 560034', product_details: '2x Apple AirTag (Pack of 4)\n1x AirTag Leather Loop', status: 'PACKED' },
  { customer_name: 'Rahul Gupta', phone_number: '+91 70123 44567', delivery_address: '8, Rajouri Garden, New Delhi - 110027', product_details: '1x Logitech MX Master 3 Mouse\n1x Mouse Pad XL', status: 'SHIPPED', courier_name: 'BlueDart', tracking_id: 'BD-9921-XMP' },
  { customer_name: 'Sneha Iyer', phone_number: '+91 88901 23456', delivery_address: '5, Nungambakkam High Road, Chennai - 600034', product_details: '3x JBL Flip 6 Speaker (Red)\n2x Speaker Stand', status: 'ORDER_CREATED' },
  { customer_name: 'Vikram Singh', phone_number: '+91 99900 87654', delivery_address: '101, Satellite Road, Ahmedabad - 380015', product_details: '1x Samsung Galaxy Tab S9\n1x Keyboard Cover Case', status: 'SHIPPED', courier_name: 'DTDC', tracking_id: 'DTDC-8812-TAB' },
  { customer_name: 'Anjali Patel', phone_number: '+91 95432 10987', delivery_address: '33, Law Garden, Ellisbridge, Ahmedabad - 380006', product_details: '1x Dell 27" 4K Monitor\n1x HDMI Cable 2m', status: 'PACKED' },
  { customer_name: 'Rohan Desai', phone_number: '+91 81299 44567', delivery_address: '7, FC Road, Deccan Gymkhana, Pune - 411004', product_details: '2x Corsair 8GB RAM DDR4 3200MHz\n1x Thermal Compound Paste', status: 'ORDER_CREATED' },
  { customer_name: 'Meera Krishnan', phone_number: '+91 79887 65432', delivery_address: '15, Jubilee Hills Road No.10, Hyderabad - 500033', product_details: '1x Apple MacBook Air M3 13"\n1x USB-C Hub 7-in-1', status: 'SHIPPED', courier_name: 'FedEx', tracking_id: 'FX-00923-MBA' },
  { customer_name: 'Amit Choudhary', phone_number: '+91 96600 12345', delivery_address: '44, Salt Lake Sector 5, Kolkata - 700091', product_details: '1x Canon EOS R50 Camera\n1x 50mm f/1.8 Lens\n1x 64GB SD Card', status: 'PACKED' },
  { customer_name: 'Nisha Agarwal', phone_number: '+91 87400 56789', delivery_address: '18, Civil Lines, Jaipur - 302006', product_details: '1x Kindle Paperwhite 11th Gen\n2x Kindle Case (Origami)', status: 'SHIPPED', courier_name: 'Ecom Express', tracking_id: 'ECX-7731-KIN' },
  { customer_name: 'Sanjay Verma', phone_number: '+91 98100 77654', delivery_address: '9, Sector 17, Chandigarh - 160017', product_details: '1x ASUS ROG Strix G16 Gaming Laptop\n1x Gaming Headset', status: 'ORDER_CREATED' },
  { customer_name: 'Divya Nair', phone_number: '+91 93300 34567', delivery_address: '28, Kaloor Main Road, Ernakulam, Kochi - 682017', product_details: '1x Dyson V15 Detect Vacuum\n1x Extra Filter Pack', status: 'PACKED' },
  { customer_name: 'Karan Malhotra', phone_number: '+91 99700 23456', delivery_address: '55, Model Town Phase 2, Ludhiana - 141002', product_details: '1x Bose QuietComfort 45\n1x Carry Case', status: 'SHIPPED', courier_name: 'Delhivery', tracking_id: 'DLV-5544-BOS' },
  { customer_name: 'Pooja Reddy', phone_number: '+91 88677 90123', delivery_address: '3, Film Nagar, Hyderabad - 500033', product_details: '2x Philips Hue Starter Kit\n4x Smart Bulb E27', status: 'ORDER_CREATED' },
  { customer_name: 'Nikhil Joshi', phone_number: '+91 76500 43210', delivery_address: '19, Shivajinagar, Pune - 411005', product_details: '1x iPad Pro 12.9" M4\n1x Apple Pencil Pro\n1x Magic Keyboard', status: 'SHIPPED', courier_name: 'BlueDart', tracking_id: 'BD-1122-IPAD' },
  { customer_name: 'Riya Shah', phone_number: '+91 92100 98765', delivery_address: '7, Residency Road, Bengaluru - 560025', product_details: '1x Nikon Z30 Camera Body\n1x 16-50mm Kit Lens', status: 'PACKED' },
  { customer_name: 'Manish Kumar', phone_number: '+91 90000 11122', delivery_address: '26, Ashok Nagar, New Delhi - 110018', product_details: '1x LG 55" OLED C3 TV\n2x HDMI 2.1 Cable', status: 'SHIPPED', courier_name: 'FedEx', tracking_id: 'FX-8899-OLED' },
  { customer_name: 'Sunita Rao', phone_number: '+91 84300 66789', delivery_address: '11, Anna Nagar East, Chennai - 600102', product_details: '1x Roomba j7+ Robot Vacuum\n1x Dust Bag Refills', status: 'ORDER_CREATED' },
  { customer_name: 'Gaurav Tiwari', phone_number: '+91 98400 33456', delivery_address: '42, Hazratganj, Lucknow - 226001', product_details: '1x Xiaomi 14 Pro (Titanium White)\n1x Wireless Charger 50W', status: 'PACKED' },
  { customer_name: 'Alka Mishra', phone_number: '+91 77800 54321', delivery_address: '3, Boring Canal Road, Patna - 800001', product_details: '1x OnePlus Watch 2\n2x Screen Guard', status: 'SHIPPED', courier_name: 'DTDC', tracking_id: 'DTDC-3310-OPW' },
  { customer_name: 'Harshit Kapoor', phone_number: '+91 99600 12456', delivery_address: '88, Sector 62, Noida - 201309', product_details: '1x Secretlab TITAN Evo Gaming Chair\n1x Lumbar Pillow', status: 'ORDER_CREATED' },
  { customer_name: 'Lakshmi Subramaniam', phone_number: '+91 85400 78901', delivery_address: '14, T. Nagar, Chennai - 600017', product_details: '1x Breville Barista Express Coffee Machine\n2x Coffee Bean Pack', status: 'PACKED' },
  { customer_name: 'Abhishek Pandey', phone_number: '+91 93700 56789', delivery_address: '5, Civil Lines, Allahabad - 211001', product_details: '1x ASUS ProArt 32" Display\n1x USB-C to DisplayPort Cable', status: 'SHIPPED', courier_name: 'Ecom Express', tracking_id: 'ECX-9921-ASU' },
  { customer_name: 'Tanvi Bhatt', phone_number: '+91 97200 34567', delivery_address: '29, Prahlad Nagar, Ahmedabad - 380015', product_details: '2x Keychron Q1 Pro Keyboard\n2x Keyboard Wrist Rest', status: 'ORDER_CREATED' },
  { customer_name: 'Deepak Bora', phone_number: '+91 86500 23456', delivery_address: '17, G.S. Road, Guwahati - 781005', product_details: '1x Ring Video Doorbell Pro 2\n1x Solar Panel Charger', status: 'PACKED' },
  { customer_name: 'Kavitha Menon', phone_number: '+91 94100 43219', delivery_address: '6, Residency Road, Trivandrum - 695001', product_details: '1x Sonos Arc Soundbar\n1x Sonos Sub Mini', status: 'SHIPPED', courier_name: 'Delhivery', tracking_id: 'DLV-7733-SON' },
  { customer_name: 'Rajesh Pillai', phone_number: '+91 98300 78654', delivery_address: '21, Marine Drive, Kochi - 682031', product_details: '1x DJI Mini 4 Pro Drone\n1x ND Filter Set\n2x Spare Battery', status: 'ORDER_CREATED' },
  { customer_name: 'Swati Saxena', phone_number: '+91 90100 65432', delivery_address: '14, Gomti Nagar, Lucknow - 226010', product_details: '1x Herman Miller Aeron Chair (Size B)', status: 'SHIPPED', courier_name: 'BlueDart', tracking_id: 'BD-5566-HMC' },
  { customer_name: 'Praveen Hegde', phone_number: '+91 75300 98765', delivery_address: '8, Indiranagar 100ft Road, Bengaluru - 560038', product_details: '1x Apple iPhone 16 Pro Max 256GB (Desert Titanium)\n1x MagSafe Case', status: 'PACKED' },
  { customer_name: 'Neetu Singh', phone_number: '+91 89900 11234', delivery_address: '19, Vaishali Nagar, Jaipur - 302021', product_details: '1x Garmin Fenix 7X Solar Smartwatch\n1x Silicone Band Pack', status: 'SHIPPED', courier_name: 'FedEx', tracking_id: 'FX-2244-GAR' },
];

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany();
    await Order.deleteMany();

    // Seed Users
    const users = [
      { email: 'admin@business.com', password_hash: 'admin123', role: 'ADMIN' },
      { email: 'orders@business.com', password_hash: 'order123', role: 'ORDER_PLACEMENT' },
      { email: 'billing@business.com', password_hash: 'bill123', role: 'BILLING' },
      { email: 'packaging@business.com', password_hash: 'pack123', role: 'PACKAGING' },
      { email: 'shipping@business.com', password_hash: 'ship123', role: 'SHIPMENT' },
    ];
    await User.create(users);
    console.log('✅ Users seeded successfully!');

    // Seed Orders with realistic past timestamps
    const ordersToInsert = fakeOrders.map((order, i) => {
      const daysAgo = 30 - i; // Spread over the last 30 days
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(daysAgo));
      return { ...order, createdAt, updatedAt: createdAt };
    });

    await Order.insertMany(ordersToInsert);
    console.log('✅ 30 Fake Orders seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding: ${(error as Error).message}`);
    process.exit(1);
  }
};

seedUsers();
