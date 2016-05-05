[usernames.io](http://usernames.io)
==============

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

quickly generate usernames
> Learn more - see "behind the scenes" [here](http://hashtaginclude.com/usernames.io/)


# API

## /new

Requests a new username, and it's availability info.

```
{
    "username": "",
    "availability": {
        "github": true,
        "linkedin": true,
        "dot-com": true,
        "facebook": true,
        "twitter": true
    }
}
```

## /availability/:service?username=&lt;username&gt;

Requests availability for a specific service and a given username.

```
{
    "service": true
}
```

# License

MIT
