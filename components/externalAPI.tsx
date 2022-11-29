

// Test curl: curl -X POST -H "Content-Type: application/json" "http://jubesi.oneidlab.kr/api/ketimsearch" -d '{"id":"phsju","pass":"Qwe789!@#"}'
async function login(userId: string, userPassword: string): Promise<boolean> {
    /*
        let formData = new FormData();
        formData.append(userId, userPassword)
    */
    let formData = JSON.stringify({
        id: userId,
        pass: userPassword,
    })

    let response = await fetch("http://jubesi.oneidlab.kr/api/ketimsearch", {
        method: "POST",
        body: formData,
    });
    
    let jsonResponse = await response.json()
    console.log(jsonResponse)
    if (jsonResponse["result"] == "Success") {
        return true
    } else {
        return false
    }
}


// Test curl: curl -sX GET "http://admjubesi.oneidlab.kr/song/req_url?f_songcd=JA0011002001017"
async function requestDownloadURL(songId: string): Promise<any> {
    
    let response = await fetch("http://admjubesi.oneidlab.kr/song/req_url?f_songcd="+songId, {
        method: "GET",
    });
    
    let jsonResponse = await response.json()
    return jsonResponse
}

export {login,requestDownloadURL}