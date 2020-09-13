# Scrypta VM

Questo repository descrive il funzionamento della Scrypta Virtual Machine, le motivazioni della sua creazione e l'implmentazione nel contesto degli IdaNodes che permetteranno di creare ed eseguire "Smart Contracts" (software che vengono eseguiti e che mantengono uno stato all'interno di una rete decentralizzati) creando quindi un numero indefinito di nuovi casi d'uso.

## Abstract

Scrypta nasce da un fork di PIVX e poggia le sue basi blockchain direttamente sui concetti di Bitcoin (essendo PIVX un fork di Dash, che a sua volta è un fork di Bitcoin). Questo vuol dire che all'interno della blockchain di Scrypta non esiste alcun riferimento al concetto degli Smart Contracts. 

Sebbene siamo fortemente convinti che le applicazioni decentralizzate non abbiano in gran parte necessità di Smart Contracts dall'altra ci rendiamo conto che ci sono tante altre applicazioni che hanno bisogno di funzionare con una logica fortemente decentralizzata e altamente scalabile. Detto questo abbiamo iniziato a ragionare sulla possibilità di permettere a terzi sviluppatori di utilizzare la nostra tecnologia di "backend", ovvero gli IdaNode, senza di fatto corromperli o dover agire direttamente dentro il codice sorgente.

Fino a questo momento tutte le applicazioni che richiedevano di interagire con una logica "aggiuntiva" hanno dovuto creare nuovi progetti che interagissero con gli IdaNode, demandando quindi ad ulteriori software il mantenimento di particolari logiche.

Dopo un'attenta analisi delle varie piattaforme di Smart Contracts esistenti abbiamo cercato di definire delle "qualità" che doveva avere il nostro sistema:

- **Scalabilità:** il sistema deve essere fortemente scalabile garantendo una stabilità nell'utilizzo della piattaforma all'aumentare del suo utilizzo.

- **Automatismo:** il sistema deve essere in grado di "auto-eseguirsi" o eseguire determinate azioni in modo totalmente automatico.

- **Semplicità:** il sistema deve dare allo sviluppatore facilità di sviluppo senza dover imparare quindi nuovi linguaggi di programmazione.

- **Aggiornabilità:** il sistema deve garantire l'aggiornamento del software pur mantenendo la sua immutabilità.

Riteniamo che il sistema pensato riesca effettivamente a soddisfare tutti i requisiti di cui sopra, nei prossimi paragrafi spiegeremo come.

## IdaNodes, VM e compiler

Alla base del funzionamento della piattaforma abbiamo tre entità: 

- **IdaNodes:** utilizzati per interagire con la blockchain in lettura e in scrittura, questi permetteranno l'esecuzione dello Smart Contract e manterranno all'interno del proprio database gli stati dello Smart Contract stesso, sulla base delle interazioni e delle regole scritte all'interno del codice.

- **Virtual Machine:** la virtual machine (VM2) permette di esguire del codice *"untrusted"* ovvero *ospite* dell'IdaNode ed è l'ambiente sicuro in cui il codice viene eseguito. La Virtual Machine avrà a disposizione pochi, predefiniti, moduli interni e potrà interagire con il database dell'IdaNode limitatamente alla propria sfera di competenza.

- **Compiler:** sebbene gli Smart Contracts si scrivano in Javascript il compiler permetterà di *tradurre* determinate regole predefinite (come ad esempio la lettura e la scrittura del database) in linguaggio nativo capace di comunicare con l'IdaNode.

## IdaNode Modules

Ed eccoci arrivati alla parte più importante: i moduli. Sebbene possiamo continuare a chiamarli "Smart Contracts" di fatto la piattaforma permette di realizzare dei *moduli / estensioni / come preferite chiamarli* per l'IdaNode. Questi moduli verranno quindi *abilitati* all'interno dell'IdaNode e quindi mantenuti da uno o più IdaNodes specifici. Qui arriviamo al primo punto nella nostra lista di caratteristiche richieste: *la scalabilità*.

I moduli non vengono nativamente inclusi in tutti gli IdaNode, ma solo in quelli che hanno *l'interesse* di mantenerli e quindi *l'interesse* a fornire più o meno potenza di calcolo per l'esecuzione degli stessi. 

Questo vuol dire che una specifica applicazione può essere mantenuta solo dal suo creatore oppure da tutti i soggetti interessati ad usarla, questo significa quindi che il numero degli interessati crescerà con l'aumento dell'utenza e quindi il sistema avrà sempre potenza di calcolo a disposizione per servire i diversi utenti.

Questo tipo di approccio è già stato usato in applicazioni decentralizzate come IPFS o Torrent.

## Clock e automatismo

L'interazione specifica con gli IdaNode permette di risolvere un altro grande problema riscontrato in altre piattaforme di Smart Contracts ovvero gli automatismi. Sebbene sia generalmente diffusa l'idea che lo Smart Contract "si auto esegue sulla base di specifiche regole" tale idea è drasticamente errata.

Facendo l'esempio di Ethereum uno smart contract può eventualmente avere "automaticamente" delle condizioni tali per cui `se` eseguito (e ripetiamo il *se*) porterà ad un cambio di stato all'interno dello stesso.

Questo perchè la Ethereum Virtual Machine non ha un vero e proprio `clock` ovvero una caratteristica fondamentale di tutte le *macchine* elettroniche e che permette di sincronizzarsi per mezzo di un determinato *ciclo*. Nei computer è calcolato ad esempio in Hertz (GHz) e definisce la quantità eseguire operazioni che il computer può eseguire ogni secondo. 

Chiaramente per estendere il concetto di *clock* alla blockchain dobbiamo astrarci dal concetto legato ai computer e pensare che il *clock* della VM (ovvero il momento in cui la macchina sincronizza) sia l'emissione di un blocco, che nella rete Scrypta è di circa 1 minuto.

Questo significa che possiamo pensare di far eseguire al nostro Smart Contract *almeno* un'operazione ogni blocco, ovvero quando è stato concluso un "ciclo".

Abbiamo quindi creato la base per gli automatismi, tutti gli Smart Contract potranno richiamare la funzione `onBlock` ed **auto-eseguire** del codice a prescindere dal fatto che qualcuno richiama o non richiama lo Smart Contract stesso!

## Immutabilità ed aggiornabilità

Parlando di blockchain e di Smart Contract non possiamo che accennare ad una delle caratteristiche fondamentali che deve avere il codice: l'immutabilità.

L'immutabilità è garantita dalla blockchain in quanto il codice non viene direttamente eseguito da un file, ma questo file deve essere prima caricato all'interno di un indirizzo, grazie alle tecniche che conosciamo. Il codice eseguito dalla VM e dall'utente è quindi ben definito e statico e abbiamo la garanzia che il codice è stato pubblicato dal suo autore grazie ad un processo di doppia firma.

Qualsiasi software durante la propria *vita* ha però bisogno di aggiornamenti e questo è un dato di fatto. Grazie alla tecnica del *Progressive Data Management* applicata anche nel tool `Scrypta-BVC` è possibile aggiornare il codice sorgente dello Smart Contract pubblicando quindi delle versioni correttive e / o di modifica di funzionalità.

Questa feature sarà tuttavia opzionale e verrà definita al primo deploy dello Smart Contract.

## Interazione con lo Smart Contract

L'IdaNode a questo punto permetterà di interagire con il contratto per mezzo di una specifica API che espone i metodi scritti all'interno del contratto. L'utente, per mezzo di un'interfaccia grafica (quella della dApp) potrà interagirvi eseguendo le azioni che porteranno quindi al cambio di stato all'interno del contratto stesso. 

## Conclusioni

Abbiamo concluso con la spiegazione teorica del funzionamento degli Smart Contract su Scrypta. Questa nuova feature verrà implementata dalla versione `2.0.0` degli IdaNodes e seguirà ulteriore documentazione tecnica di funzionamento, di scrittura degli Smart Contracts e di uso da parte dell'utente.