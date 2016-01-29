define({ "api": [  {    "type": "post",    "url": "api/reloadApp",    "title": "reloadApp",    "description": "<p>updates location and receives new messages</p>",    "name": "ReloadApp",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "emergency_case_id",            "description": ""          },          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "last_message_received",            "description": ""          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "geo_data",            "description": "<p>geo JSON string</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "JSON",            "description": "<p>messages</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "/admin/app/Http/routes.php",    "group": "admin_app_Http_routes_php",    "groupTitle": "admin_app_Http_routes_php"  },  {    "type": "get",    "url": "/api/cases/create",    "title": "CreateCase",    "description": "<p>creates new case if submitted geolocation is in any operation area</p>",    "name": "CreateCase",    "group": "case",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": true,            "field": "status",            "description": ""          },          {            "group": "Parameter",            "type": "String",            "optional": true,            "field": "condition",            "description": ""          },          {            "group": "Parameter",            "type": "String",            "optional": true,            "field": "boat_type",            "description": ""          },          {            "group": "Parameter",            "type": "bool",            "optional": true,            "field": "other_involved",            "description": ""          },          {            "group": "Parameter",            "type": "bool",            "optional": true,            "field": "engine_working",            "description": ""          },          {            "group": "Parameter",            "type": "Number",            "optional": true,            "field": "passenger_count",            "description": ""          },          {            "group": "Parameter",            "type": "String",            "optional": true,            "field": "additional_informations",            "description": ""          },          {            "group": "Parameter",            "type": "Number",            "optional": true,            "field": "spotting_distance",            "description": ""          },          {            "group": "Parameter",            "type": "Number",            "optional": true,            "field": "spotting_direction",            "description": "<p>in degrees</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": true,            "field": "picture",            "description": "<p>base64 encoded picture</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "source",            "description": "<p>source</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "location_data",            "description": "<p>geo JSON string</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "case_id",            "description": ""          }        ]      }    },    "version": "0.0.0",    "filename": "/admin/app/Http/routes.php",    "groupTitle": "case"  },  {    "type": "get",    "url": "api/cases/operation_area/:id",    "title": "CasesInOperationArea",    "description": "<p>sends get cases in operation area (for backend)</p>",    "name": "CasesInOperationArea",    "group": "cases",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "JSON",            "description": "<p>cases</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "/admin/app/Http/routes.php",    "groupTitle": "cases"  },  {    "type": "post",    "url": "api/cases/getInvolved",    "title": "GetInvolved",    "description": "<p>adds user to db table involved_users and returns message (auth required)</p>",    "name": "GetInvolved",    "group": "cases",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "case_id",            "description": ""          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "JSON",            "description": "<p>emergency_case_messages</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "/admin/app/Http/routes.php",    "groupTitle": "cases"  },  {    "type": "post",    "url": "/api/messages/send",    "title": "SendMessage",    "description": "<p>sends message and adds location</p>",    "name": "SendMessage",    "group": "message",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "emergency_case_id",            "description": "<p>id of the opened case.</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "sender_type",            "description": "<p>refugee/land_operator_rumors.</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "sender_id",            "description": "<p>sender device unique id/fingerprint</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "geo_data",            "description": "<p>geo JSON string</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "firstname",            "description": "<p>Firstname of the User.</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "lastname",            "description": "<p>Lastname of the User.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "/admin/app/Http/routes.php",    "groupTitle": "message"  },  {    "type": "post",    "url": "api/cases/sendMessageCrew",    "title": "submit message (only for backend, auth required)",    "name": "SendMessageCrew",    "group": "message",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "case_id",            "description": ""          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "message",            "description": ""          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Number",            "optional": false,            "field": "message_id",            "description": ""          }        ]      }    },    "version": "0.0.0",    "filename": "/admin/app/Http/routes.php",    "groupTitle": "message"  }] });