(function () {

    let saveAlbum = document.querySelector("#saveAlbum");
    let addAlbum = document.querySelector("#addAlbum");
    let deleteAlbum = document.querySelector("#deleteAlbum");
    let importAlbum = document.querySelector("#importAlbum");
    let exportAlbum = document.querySelector("#exportAlbum");
    let playAlbum = document.querySelector("#playAlbum");
    let selectAlbum = document.querySelector("#selectAlbum");
    let allTemplates = document.querySelector("#allTemplates");
    let overlay = document.querySelector("#overlay");
    let playOverlay = document.querySelector("#play-overlay");
    let contentDetailsOverlay = document.querySelector("#content-details-overlay");
    let newSlide = document.querySelector("#new-slide");
    let createSlide = document.querySelector("#create-slide");
    let showSlide = document.querySelector("#show-slide");
    let btnSaveSlide = document.querySelector("#btnSaveSlide");
    let txtSlideImage = document.querySelector("#txtSlideImage");
    let txtSlideTitle = document.querySelector("#txtSlideTitle");
    let txtSlideDesc = document.querySelector("#txtSlideDesc");
    let slideList = document.querySelector("#slide-list");
    let uploadFile = document.querySelector("#uploadFile");

    let albums = [];

    addAlbum.addEventListener("click", handleAddAlbum);
    selectAlbum.addEventListener("change", handleSelectAlbum);
    newSlide.addEventListener("click", handleNewSlideClick);
    btnSaveSlide.addEventListener("click", handleSaveSlide);
    saveAlbum.addEventListener("click", saveToLocalStorage);
    deleteAlbum.addEventListener("click", handleDeleteAlbum);
    exportAlbum.addEventListener("click", handleExportAlbum);
    importAlbum.addEventListener("click", function () {
        uploadFile.click();
    });

    uploadFile.addEventListener("change", handleImportAlbum);
    playAlbum.addEventListener("click", handlePlayAlbum);

    function handlePlayAlbum(){
        if (selectAlbum.value == "-1") {
            alert("Select an album to play");
            return;
        }

        // playOverlay.style.display = "block";

        let album = albums.find(a => a.name == selectAlbum.value);

        let counter = album.slides.length;
        let i = 0;
        let id = setInterval(function(){
            slideList.children[i].click();
            // playOverlay.querySelector('#text').innerHTML = "Showing slide " + (i + 1);

            i++;
            if(i == counter) {
                clearInterval(id);
                // playOverlay.style.display = "none";
                return;
            }
        }, 500);
    }

    function handleAddAlbum() {
        let albumName = prompt("Enter a name for the new album");
        if (albumName == null) {
            return;
        }

        albumName = albumName.trim();
        if (!albumName) {
            alert("Empty name not allowed");
            return;
        }

        let exists = albums.some(a => a.name == albumName);
        if (exists) {
            alert(albumName + " already exists. Please use a unique name");
            return;
        }

        let album = {
            name: albumName,
            slides: []
        };
        albums.push(album);

        //Add in dropdown
        let optionTemplate = allTemplates.content.querySelector("[purpose=new-album]"); //[] is for attribute
        let newAlbumOption = document.importNode(optionTemplate, true);

        newAlbumOption.setAttribute("value", albumName);
        newAlbumOption.innerHTML = albumName;
        selectAlbum.appendChild(newAlbumOption);

        //Newly added album automatically get selected
        selectAlbum.value = albumName;
        selectAlbum.dispatchEvent(new Event("change"));
    };

    function handleSelectAlbum() {

        if (this.value == "-1") {
            overlay.style.display = "block";
            contentDetailsOverlay.style.display = "none";  //bahar wala overlay ka ulta chalega
            createSlide.style.display = "none";
            showSlide.style.display = "none";

            slideList.innerHTML = ""; //this help in deleting slide from slide list under handleDeleteAlbum function
        } else {
            overlay.style.display = "none";
            contentDetailsOverlay.style.display = "block";
            createSlide.style.display = "none";
            showSlide.style.display = "none";

            //albums array mein check karo kaha selected hai
            let album = albums.find(a => a.name == selectAlbum.value);
            slideList.innerHTML = "";

            for (let i = 0; i < album.slides.length; i++) {
                let slideTemplate = allTemplates.content.querySelector(".slide");
                let slide = document.importNode(slideTemplate, true);

                slide.querySelector(".title").innerHTML = album.slides[i].title;
                slide.querySelector(".desc").innerHTML = album.slides[i].desc;
                slide.querySelector("img").setAttribute("src", album.slides[i].url);
                slide.addEventListener("click", handleSlideClick);

                album.slides[i].selected = false; //Initially when new album is selected. no slide of that album is selected, this is for edit delete of slide

                slideList.append(slide);
            }
        }
    };

    function handleDeleteAlbum() {
        if (selectAlbum.value == "-1") {
            alert("Select an album to delete");
            return;
        }
        //Remove from albums array
        let aidx = albums.findIndex(a => a.name == selectAlbum.value);
        albums.splice(aidx, 1);

        //Delete from dropdown
        selectAlbum.remove(selectAlbum.selectedIndex);

        selectAlbum.value = "-1";
        selectAlbum.dispatchEvent(new Event("change"));

    };

    function handleExportAlbum() {
        if (selectAlbum.value == "-1") {
            alert("Select an album to export");
            return;
        }

        let album = albums.find(a => a.name == selectAlbum.value);
        let ajson = JSON.stringify(album);
        let encodedJson = encodeURIComponent(ajson);

        let a = document.createElement("a");
        a.setAttribute("download", album.name + ".json");
        a.setAttribute("href", "data:text/json; charset=utf-8, " + encodedJson);

        a.click();
    };

    function handleImportAlbum() {
        if (selectAlbum.value == "-1") {
            alert("Select an album to import");
            return;
        }

        let file = window.event.target.files[0];
        let reader = new FileReader();
        reader.addEventListener("load", function () { //load event will fire after file being read
            let data = window.event.target.result;
            let importedAlbum = JSON.parse(data);

            let album = albums.find(a => a.name == selectAlbum.value);
            album.slides = album.slides.concat(importedAlbum.slides); //adding slides of importedAlbums to album

            slideList.innerHTML = "";
            for (let i = 0; i < album.slides.length; i++) {
                let slideTemplate = allTemplates.content.querySelector(".slide");
                let slide = document.importNode(slideTemplate, true);

                slide.querySelector(".title").innerHTML = album.slides[i].title;
                slide.querySelector(".desc").innerHTML = album.slides[i].desc;
                slide.querySelector("img").setAttribute("src", album.slides[i].url);
                slide.addEventListener("click", handleSlideClick);

                album.slides[i].selected = false; //Initially when new album is selected. no slide of that album is selected, this is for edit delete of slide

                slideList.append(slide);
            }
        });

        reader.readAsText(file);
    }

    function handleNewSlideClick() {
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";
        createSlide.style.display = "block";
        showSlide.style.display = "none";

        //empty newslideclick after click
        txtSlideImage.value = "";
        txtSlideTitle.value = "";
        txtSlideDesc.value = "";

        btnSaveSlide.setAttribute("purpose", "create"); //If button is clicked in create new slide then purpose is create

    };

    function handleSaveSlide() {
        let url = txtSlideImage.value;
        let title = txtSlideTitle.value;
        let desc = txtSlideDesc.value;

        if (url == "" || title == "" || desc == "") {
            alert("Fields can't empty");
            return;
        }

        if (this.getAttribute("purpose") == "create") {

            let slideTemplate = allTemplates.content.querySelector(".slide");
            let slide = document.importNode(slideTemplate, true);

            slide.querySelector(".title").innerHTML = title;
            slide.querySelector(".desc").innerHTML = desc;
            slide.querySelector("img").setAttribute("src", url);
            slide.addEventListener("click", handleSlideClick);

            slideList.append(slide);

            //Give me that album which is selected //Jo album select kiye ussi ki cheze dikhayi de
            let album = albums.find(a => a.name == selectAlbum.value);
            album.slides.push({
                title: title,
                url: url,
                desc: desc
            })

            slide.dispatchEvent(new Event("click"));
        } else {
            let album = albums.find(a => a.name == selectAlbum.value);
            let slideToUpdate = album.slides.find(s => s.selected == true);

            let slideDivToUpdate;
            for (let i = 0; i < slideList.children.length; i++) {
                let slideDiv = slideList.children[i];
                if (slideDiv.querySelector(".title").innerHTML == slideToUpdate.title) {
                    slideDivToUpdate = slideDiv;
                    break;
                }
            }

            slideDivToUpdate.querySelector(".title").innerHTML = title;
            slideDivToUpdate.querySelector(".desc").innerHTML = desc;
            slideDivToUpdate.querySelector("img").setAttribute("src", url);

            slideToUpdate.title = title,
                slideToUpdate.url = url,
                slideToUpdate.desc = desc

            slideDivToUpdate.dispatchEvent(new Event("click"));

        }

    };

    function handleSlideClick() {
        showSlide.style.display = "block";

        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";
        createSlide.style.display = "none";

        showSlide.innerHTML = "";

        let slideInViewTemplate = allTemplates.content.querySelector(".slide-in-view");
        let slideInView = document.importNode(slideInViewTemplate, true);

        slideInView.querySelector(".title").innerHTML = this.querySelector(".title").innerHTML; //jis slide pe click hua uska title,desc and src
        slideInView.querySelector(".desc").innerHTML = this.querySelector(".desc").innerHTML;
        slideInView.querySelector("img").setAttribute("src", this.querySelector("img").getAttribute("src"));
        //Main content edit delete after entry
        slideInView.querySelector("[purpose=edit]").addEventListener("click", handleEditSlideClick);
        slideInView.querySelector("[purpose=delete]").addEventListener("click", handleDeleteSlideClick);

        showSlide.append(slideInView);

        //Applying selected property on slide which is currently showing, this will help in edit and delete of slide
        //We are applying selected property correspoding to object of slide which is visible on screen
        let album = albums.find(a => a.name == selectAlbum.value);
        for (let i = 0; i < album.slides.length; i++) {
            if (album.slides[i].title == this.querySelector(".title").innerHTML) {
                album.slides[i].selected = true;
            } else {
                album.slides[i].selected = false;
            }
        }


    };

    function handleEditSlideClick() {
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";
        createSlide.style.display = "block";
        showSlide.style.display = "none";

        let album = albums.find(a => a.name == selectAlbum.value);
        let slide = album.slides.find(s => s.selected == true);   //We have already applied true to selected slide

        txtSlideImage.value = slide.url;
        txtSlideTitle.value = slide.title;
        txtSlideDesc.value = slide.desc;

        btnSaveSlide.setAttribute("purpose", "update"); //If button is clicked in edit then purpose is update
    };

    function handleDeleteSlideClick() {
        let album = albums.find(a => a.name == selectAlbum.value);
        let sidx = album.slides.findIndex(s => s.selected == true);  //Got slide which is showing on screen from Database

        let slideDivTBD;
        for (let i = 0; i < slideList.children.length; i++) {  //Loop applied on slide list children
            let slideDiv = slideList.children[i];

            if (slideDiv.querySelector(".title").innerHTML == album.slides[sidx].title) {
                slideDivTBD = slideDiv;
                break;
            }
        }

        //Remove from HTML
        slideList.removeChild(slideDivTBD);

        //Remove from albums array
        album.slides.splice(sidx, 1);

        //Slide delete hone ke baad select a slide wala page aaye
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "block";
        createSlide.style.display = "none";
        showSlide.style.display = "none";

    };

    function saveToLocalStorage() {
        //we have resources in array form, we can't directly save as array we have to convert it to string
        let json = JSON.stringify(albums);//used to convert array to string which can be saved
        localStorage.setItem("data", json);

        alert("Album saved succesfully");
    };

    function loadFromLocalStorage() {
        let json = localStorage.getItem("data");
        if (!json) {
            return;
        }

        albums = JSON.parse(json);

        //Also Add in dropdown
        for (let i = 0; i < albums.length; i++) {

            let optionTemplate = allTemplates.content.querySelector("[purpose=new-album]"); //[] is for attribute
            let newAlbumOption = document.importNode(optionTemplate, true);

            newAlbumOption.setAttribute("value", albums[i].name);
            newAlbumOption.innerHTML = albums[i].name;
            selectAlbum.appendChild(newAlbumOption);
        }

        saveAlbum.value = "-1";
    };

    loadFromLocalStorage();


})();