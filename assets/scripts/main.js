var app = new Vue({
    el: "main",
    data: {
        page: "",
        dialogs: []
    },
    methods: {
        setPage(lang = 'en', page = '')
        {
            this.page = page;
            history.pushState(null, "", `/${lang}/${this.page}/`.replace("//","/"));
        },
        getPage()
        {
            if(window.location.href.split("/").length >= 4)
            {
                if(window.location.href.split("/")[4].length > 0)
                {
                    this.setPage(window.location.href.split("/")[4]);
                }
            }
        },
        closeDialog(name)
        {
            var o = [];
            for(let dialog of this.dialogs) if(dialog != name) o.push(dialog);
            this.dialogs = o;
        },
        openDialog(name)
        {
            this.dialogs.push(name);
        }
    }
});
//app.getPage();
app.page = initial_page;