import http from "k6/http";
import { check } from 'k6';

let host = 'http://localhost:6333'
let collection_name = 'stress_collection';
let upsert_url = `${host}/collections/${collection_name}/points`;

let vector_length = 128;
let vectors_per_batch = 32;

var create_collection_payload = JSON.stringify(
    {
        "vector_size": vector_length,
        "distance": "Cosine"
    }
);

var params = {
    headers: {
        'Content-Type': 'application/json',
    },
};

var cities = [
    "Tokyo",
    "Delhi",
    "Shanghai",
    "São Paulo",
    "Mexico City",
    "Cairo",
    "Mumbai",
    "Beijing",
    "Dhaka",
    "Osaka",
    "New York City",
    "Karachi",
    "Buenos Aires",
    "Chongqing",
    "Istanbul",
    "Kolkata",
    "Manila",
    "Lagos",
    "Rio de Janeiro",
    "Tianjin",
    "Kinshasa",
    "Guangzhou",
    "Los Angeles",
    "Moscow",
    "Shenzhen",
    "Lahore",
    "Bangalore",
    "Paris",
    "Bogotá",
    "Jakarta",
    "Chennai",
    "Lima",
    "Bangkok",
    "Seoul",
    "Nagoya",
    "Hyderabad",
    "London",
    "Tehran",
    "Chicago",
    "Chengdu",
    "Nanjing",
    "Wuhan",
    "Ho Chi Minh City",
    "Luanda",
    "Ahmedabad",
    "Kuala Lumpur",
    "Xi'an",
    "Hong Kong",
    "Dongguan",
    "Hangzhou"
]

function generate_point() {
    var idx = Math.floor(Math.random() * 1000000000);
    var count = Math.floor(Math.random() * 100);
    var vector = Array.from({ length: vector_length }, () => Math.random());

    var city = cities[Math.round(Math.random()*(cities.length-1))];

    return {
        "id": idx,
        "vector": vector,
        "payload": {
            "city": { "type": "keyword", "value": city },
            "count": { "type": "integer", "value": count }
        }
    }
}

export function setup() {
    var url = `${host}/collections/${collection_name}`;

    let res_delete = http.del(url, params);
    check(res_delete, {
        'delete_collection_payload is status 200': (r) => r.status === 200,
    });
    let res_create = http.put(url, create_collection_payload, params);
    check(res_create, {
        'create_collection_payload is status 200': (r) => r.status === 200,
    });
}

export default function () {
    var payload = JSON.stringify({
        "points": Array.from({ length: vectors_per_batch }, () => generate_point()),
    });

    let res_upsert = http.put(upsert_url, payload, params);
    check(res_upsert, {
        'upsert_points is status 200': (r) => r.status === 200,
    });
}

export function teardown() {
    console.log('Done');
}